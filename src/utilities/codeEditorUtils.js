/* eslint-disable @typescript-eslint/naming-convention */
/*
Code editor utilities.
- print: mirrors the functionality of print in the Code Editor. See:
    https://developers.google.com/earth-engine/apidocs/print
- Export: mirrors the structure of Export in the Code Editor, with functions
    named identically as in the code Editor, internally wrapping them from
    ee.batch.Export. 
    ⚠️ In contrast to the code Editor, tasks
    are automatically started with a successCallback/errorCallback. 
    This is an added feature of the extension. 
    ⚠️ Another contrast is that the code Editor defines some default values
    for parameters such as description, fileNamePrefix, assetId, etc. Some of 
    could be implemented here (See 🔲 TODO's below), but not all. Therefore
    submission of tasks without these defaults will raise the errorCallback.  
    See:
    https://developers.google.com/earth-engine/apidocs/export-image-toasset
    https://developers.google.com/earth-engine/apidocs/export-image-tocloudstorage
    https://developers.google.com/earth-engine/apidocs/export-image-todrive
    https://developers.google.com/earth-engine/apidocs/export-map-tocloudstorage
    https://developers.google.com/earth-engine/apidocs/export-table-toasset
    https://developers.google.com/earth-engine/apidocs/export-table-tobigquery
    https://developers.google.com/earth-engine/apidocs/export-table-tocloudstorage
    https://developers.google.com/earth-engine/apidocs/export-table-todrive
    https://developers.google.com/earth-engine/apidocs/export-table-tofeatureview
    https://developers.google.com/earth-engine/apidocs/export-video-tocloudstorage
- Map: currently only Map.setCenter and Map.addLayer are implemented.
    The rest are empty so they can be silently ignored. 
    Map.addLayer currently only works for ee.Image
- ui, and Chart: empty skeleton classes with functions accepting
the same arguments as in the Code Editor, but doing nothing, i.e., 
any user code calling thee functions is silently ignored. 
*/


exports.Log = function(log){
    return function(...args){
      args.forEach((line)=>{
      if(line){
        if(typeof line==="object"){
            log.appendLine(JSON.stringify(line));
        }else{
            log.appendLine(line.toString());
        }
      }
    });
    };
};

/*
Wraps a function to print one or more arguments
to a given log (vscode.window.OutputChannel)
If an argument is an object with the getInfo method,
then getInfo() is called asynchronously. 
*/
exports.Print = function(log){
    return function(...args){
      args.forEach((object)=>{
      if(object){
        if (typeof object === "object"){
            if ("getInfo" in object){
                object.getInfo(log);
            }else{
            log(object);
            }
        }else{
            log(object);
        }
      }
      });
    };
};

/* ExportImage: wrapper for ee.batchExport.image.toXXX 
functions, but also starts the tasks automatically.
*/
class ExportImage {
    constructor(ee, successCallback, errCallback){
        this.toAsset = function(...args){
          var computed = false;
          var clientConfig = ee.arguments.extractFromFunction(
              ee.batch.Export.image.toAsset, arguments);
          if(!Object.hasOwn(clientConfig,"description")){
              clientConfig["description"] = "myEETasksExportImageTask";
          }
          //🔲 TODO: assetId default to
          // projects/PROJECT/assets/ + description
          if (Object.hasOwn(clientConfig, "region")){
            var region = clientConfig["region"];
            if (region.func){
              computed = true;
              region.evaluate(
                  (r)=>{
              clientConfig["region"] = r;
              return ee.batch.Export.image.toAsset(clientConfig)
              .start(successCallback, errCallback);
                  }
              );
            }
            if (!computed){
            return ee.batch.Export.image.toAsset(clientConfig)
            .start(successCallback, errCallback);
           }
           }
        };

        this.toCloudStorage = function(...args){
          var computed = false;
          var clientConfig = ee.arguments.extractFromFunction(
              ee.batch.Export.image.toCloudStorage, arguments);
          if(!Object.hasOwn(clientConfig,"description")){
              clientConfig["description"] = "myEETasksExportImageTask";
          }
          if(!Object.hasOwn(clientConfig,"fileNamePrefix")){
              clientConfig["fileNamePrefix"] = clientConfig["description"];
          }
          if (Object.hasOwn(clientConfig, "region")){
            var region = clientConfig["region"];
            if (region.func){
              computed=true;
              region.evaluate(
                  (r)=>{
              clientConfig["region"] = r;
              return ee.batch.Export.image.toCloudStorage(clientConfig)
              .start(successCallback, errCallback);
                  }
              );
            }
          }
          if (!computed){
            return ee.batch.Export.image.toCloudStorage(clientConfig)
            .start(successCallback, errCallback);
          }
        };

        this.toDrive = function(...args){
          var computed = false;
          var clientConfig = ee.arguments.extractFromFunction(
              ee.batch.Export.image.toDrive, arguments);
          if(!Object.hasOwn(clientConfig,"description")){
              clientConfig["description"] = "myEETasksExportImageTask";
          }
          if(!Object.hasOwn(clientConfig,"fileNamePrefix")){
              clientConfig["fileNamePrefix"] = clientConfig["description"];
          }
          if (Object.hasOwn(clientConfig, "region")){
            var region = clientConfig["region"];
            if (region.func){
              computed=true;
              region.evaluate(
                  (r)=>{
              clientConfig["region"] = r;
              return ee.batch.Export.image.toDrive(clientConfig)
              .start(successCallback, errCallback);
                  }
              );
            }
          }
          if (!computed){
            return ee.batch.Export.image.toDrive(clientConfig)
            .start(successCallback, errCallback);
          }
        };
    }
}

/* ExportMap: wrapper for ee.batchExport.map.toXXX 
functions, but also starts the tasks automatically.
🔲 TODO: defaults?
*/
class ExportMap {
    constructor(ee, successCallback, errCallback){
        this.toCloudStorage = function(...args){
            return ee.batch.Export.map.toCloudStorage(...args)
            .start(successCallback, errCallback);
        };
    }
}

/* ExportVideo: wrapper for ee.batchExport.video.toXXX 
functions, but also starts the tasks automatically.
🔲 TODO: defaults?
*/
class ExportVideo {
    constructor(ee, successCallback, errCallback){
        this.toCloudStorage = function(...args){
            return ee.batch.Export.video.toCloudStorage(...args)
            .start(successCallback, errCallback);
        };
    }
}

/* ExportTable: wrapper for ee.batchExport.table.toXXX 
functions, but also starts the tasks automatically.
🔲 TODO: description default to myExportTableTask
*/
class ExportTable {
    constructor(ee, successCallback, errCallback){
        this.toAsset = function(...args){
        //🔲 TODO: assetId default to
        // projects/PROJECT/assets/ + description
            return ee.batch.Export.table.toAsset(...args)
            .start(successCallback, errCallback);
        };
        this.toCloudStorage = function(...args){
        //🔲 TODO: fileNamePrefix default to description
        //🔲 TODO: bucket default?
            return ee.batch.Export.table.toCloudStorage(...args)
            .start(successCallback, errCallback);
        };
        this.toDrive = function(...args){
        //🔲 TODO: fileNamePrefix default to description
            return ee.batch.Export.table.toDrive(...args)
            .start(successCallback, errCallback);
        };
        this.toBigQuery = function(...args){
        //🔲 TODO: defaults?
            return ee.batch.Export.table.toBigQuery(...args)
            .start(successCallback, errCallback);
        };
        this.toFeatureView = function(...args){
        //🔲 TODO: defaults?
            return ee.batch.Export.table.toFeatureView(...args)
            .start(successCallback, errCallback);
        };
    }
}

class ExportConstructor{
    constructor(ee, successCallback, errCallback){
        this.table = new ExportTable(ee, successCallback, errCallback);
        this.image = new ExportImage(ee, successCallback, errCallback);
        this.map = new ExportMap(ee, successCallback, errCallback);
        this.video = new ExportVideo(ee, successCallback, errCallback);
    }
}
exports.Export = ExportConstructor;
   
/*
The rest are defined to be silently ignored:
Map
Chart
ui
*/

class MapConstructor{
   /*
   Map Class

   Functional:
    - setCenter
    - addLayer (only ee.Image)

   All other function are defined similarly as in 
   the code editor but are silently ignored.
   */
   constructor(ee, successCallback, errCallback, vsMap, vsUri){
    this._vsMapPanel = undefined; 
    this._openMapPanelIfNeeded = function(){
        if (typeof this._vsMapPanel === 'undefined'){
            this._vsMapPanel = vsMap.render(vsUri);
        }
    };

    this.add=function(item){};

    this.setCenter=function(lon,lat,zoom){
      this._openMapPanelIfNeeded();

      const coord = [lat, lon];
      this._vsMapPanel.setView(coord, zoom);

    };
    this.addLayer=function(eeObject,visParams,name,shown,opacity){
        this._openMapPanelIfNeeded();

        if (typeof eeObject.mosaic === 'function'){
            // ImageCollection has a `mosaic` method:
            eeObject = eeObject.mosaic(); 
        }else{
            // Both geometry and feature have a `centroid` method
            // FeatureCollection has the `aggregate_array` method
            if(typeof eeObject.centroid === 'function' || typeof eeObject.aggregate_array === 'function'){
                var features = ee.FeatureCollection(eeObject);
                var color = visParams && visParams.color ? visParams.color : '000000';
                var width = visParams && visParams.width ? visParams.width : 2;
                var imageOutline = features.style({
                    color: color,
                    fillColor: '00000000',
                    width: width
                });
                eeObject = features.style({fillColor: color})
                .updateMask(ee.Image.constant(0.5))
                .blend(imageOutline);
            }
        }
        const request = ee.data.images.applyVisualization(eeObject, visParams);
        const mapId = ee.data.getMapId(request);
        this._vsMapPanel.addLayer(mapId.urlFormat, name, shown, opacity);
   };   
   
   this.centerObject=function(object,zoom,onComplete){};
   this.clear=function(){};
   this.drawingTools=function(){};
   this.getBounds=function(asGeoJSON){};
   this.getCenter=function(){};
   this.getScale=function(){};
   this.getZoom=function(){};
   this.layers=function(){};
   this.onChangeBounds=function(callback){};
   this.onChangeCenter=function(callback){};
   this.onChangeZoom=function(callback){};
   this.onClick=function(callback){};
   this.onIdle=function(callback){};
   this.onTileLoaded=function(callback){};
   this.remove=function(item){};
   this.setControlVisibility=function(all,layerList,zoomControl,scaleControl,
    mapTypeControl,fullscreenControl,drawingToolsControl){};
   this.setGestureHandling=function(option){};
   this.setZoom=function(zoom){};
   this.style=function(){};
   this.unlisten=function(idOrType){};
   this.widgets=function(){};
    }

}

exports.Map = MapConstructor;

class uiButton{
    constructor(label, onClick, disabled, style, imageUrl){}
    getDisabled=function(){};
    getImageUrl=function(){};
    getLabel=function(){};
    onClick=function(callback){};
    setDisabled=function(disabled){};
    setImageUrl=function(imageUrl){};
    setLabel=function(label){};
    style=function(){};
    unlisten=function(idOrType){};
}
class uiChartArray{
    constructor(){}
    values=function(array, axis, xLabels){};
}
class uiChartFeature{
    constructor(){}
    byFeature=function(features, xProperty, yProperties){};
    byProperty=function(features, xProperties, seriesProperty){};
    groups=function(features, xProperty, yProperty, seriesProperty){};
    histogram=function(features, property, maxBuckets, minBucketWidth, maxRaw){};
}
class uiChartImage{
    constructor(){}
    byClass=function(image, classBand, region, reducer, scale, classLabels, xLabels){};
    byRegion=function(image, regions, reducer, scale, xProperty){};
    doySeries=function(imageCollection, region, regionReducer, scale, yearReducer, startDay, endDay){};
    doySeriesByRegion=function(imageCollection, bandName, regions, regionReducer, scale, yearReducer, seriesProperty, startDay, endDay){};
    doySeriesByYear=function(imageCollection, bandName, region, regionReducer, scale, sameDayReducer, startDay, endDay){};
    histogram=function(image, region, scale, maxBuckets, minBucketWidth, maxRaw, maxPixels){};
    regions=function(image, regions, reducer, scale, seriesProperty, xLabels){};
    series=function(imageCollection, region, reducer, scale, xProperty){};
    seriesByRegion=function(imageCollection, regions, reducer, band, scale, xProperty, seriesProperty){};
}
class uiChart{
    constructor(dataTable, chartType, options, view, downloadable){}
    array = new uiChartArray();
    feature = new uiChartFeature();
    image = new uiChartImage();
    getChartType=function(){};
    getDataTable=function(){};
    getDownloadable=function(){};
    getOptions=function(){};
    getView=function(){};
    onClick=function(callback){};
    setChartType=function(chartType){};
    setDataTable=function(dataTable){};
    setDownloadable=function(Whether){};
    setOptions=function(options){};
    setSeriesNames=function(seriesNames, seriesIndex){};
    setView=function(view){};
    style=function(){};
    unlisten=function(idOrType){};
}
class uiCheckbox{
    constructor(label, value, onChange, disabled, style){}
    getDisabled=function(){};
    getLabel=function(){};
    getValue=function(){};
    onChange=function(callback){};
    setDisabled=function(disabled){};
    setLabel=function(value){};
    setValue=function(value, trigger){};
    style=function(){};
    unlisten=function(idOrType){};
}
class uiDateSlider{
    constructor(start, end, value, period, onChange, disabled, style){}
    getDisabled=function(){};
    getEnd=function(){};
    getPeriod=function(){};
    getStart=function(){};
    getValue=function(){};
    onChange=function(callback){};
    setDisabled=function(disabled){};
    setEnd=function(value){};
    setPeriod=function(value){};
    setStart=function(start){};
    setValue=function(value, trigger){};
    style=function(){};
    unlisten=function(idOrType){};
}
class uiLabel{
    constructor(value, style, targetUrl, imageUrl){}
    getImageUrl=function(){};
    getUrl=function(){};
    getValue=function(){};
    setImageUrl=function(imageUrl){};
    setUrl=function(targetUrl){};
    setValue=function(value){};
    style=function(){};
}
class uiMapCloudStorageLayer{
    constructor(bucket, path, maxZoom, suffix, name, shown, opacity){}
    getBucket=function(){};
    getMaxZoom=function(){};
    getName=function(){};
    getOpacity=function(){};
    getPath=function(){};
    getShown=function(){};
    getSuffix=function(){};
    setBucket=function(bucket){};
    setMaxZoom=function(maxZoom){};
    setName=function(name){};
    setOpacity=function(opacity){};
    setPath=function(path){};
    setShown=function(shown){};
    setSuffix=function(suffix){};
}
class uiMapDrawingTools{
    constructor(layers, shape, selected, shown, linked){}
    addLayer=function(geometries, name, color, shown, locked){};
    clear=function(){};
    draw=function(){};
    edit=function(){};
    get=function(key){};
    getDrawModes=function(){};
    getLinked=function(){};
    getMap=function(){};
    getSelected=function(){};
    getShape=function(){};
    getShown=function(){};
    layers=function(){};
    onDraw=function(callback){};
    onEdit=function(callback){};
    onErase=function(callback){};
    onLayerAdd=function(callback){};
    onLayerConfig=function(callback){};
    onLayerRemove=function(callback){};
    onLayerSelect=function(callback){};
    onSelect=function(callback){};
    onShapeChange=function(callback){};
    set=function(keyOrDict, value){};
    setDrawModes=function(drawModes){};
    setLinked=function(linked){};
    setSelected=function(layer){};
    setShape=function(shape){};
    setShown=function(shown){};
    stop=function(){};
    toFeatureCollection=function(indexProperty){};
    unlisten=function(idOrType){};
}
class uiMapFeatureViewLayer{
    constructor(assetId, visParams, name, shown, opacity){};
    getAssetId=function(){};
    getName=function(){};
    getOpacity=function(){};
    getShown=function(){};
    getVisParams=function(){};
    setAssetId=function(assetId){};
    setName=function(name){};
    setOpacity=function(opacity){};
    setShown=function(shown){};
    setVisParams=function(visParams){};
}
class uiMapGeometryLayer{
    constructor(geometries, name, color, shown, locked){};
    fromGeometry=function(geometry){};
    geometries=function(){};
    get=function(key){};
    getColor=function(){};
    getEeObject=function(){};
    getLocked=function(){};
    getName=function(){};
    getShown=function(){};
    openConfigurationDialog=function(){};
    set=function(keyOrDict, value){};
    setColor=function(color){};
    setLocked=function(locked){};
    setName=function(name){};
    setShown=function(shown){};
    toGeometry=function(){};
}
class uiMapLayer{
    constructor(eeObject, visParams, name, shown, opacity){};
    getEeObject=function(){};
    getName=function(){};
    getOpacity=function(){};
    getShown=function(){};
    getVisParams=function(){};
    setEeObject=function(eeObject){};
    setName=function(name){};
    setOpacity=function(opacity){};
    setShown=function(shown){};
    setVisParams=function(visParams){};
}
class uiMapLinker{
    constructor(maps, event){};
    add=function(el){};
    forEach=function(callback){};
    get=function(index){};
    getJsArray=function(){};
    insert=function(index, el){};
    length=function(){};
    remove=function(el){};
    reset=function(list){};
    set=function(index, el){};
}
class uiMap{
    constructor(center, onClick, style){}
    CloudStorageLayer = new uiMapCloudStorageLayer();
    drawingTools = new uiMapDrawingTools();
    FeatureViewLayer = new uiMapFeatureViewLayer();
    GeometryLayer = new uiMapGeometryLayer();
    MapLayer = new uiMapLayer();
    Linker = new uiMapLinker();
    add=function(item){};
    addLayer=function(eeObject, visParams, name, shown, opacity){};
    centerObject=function(object, zoom, onComplete){};
    clear=function(){};
    drawingTools=function(){};
    getBounds=function(asGeoJSON){};
    getCenter=function(){};
    getScale=function(){};
    getZoom=function(){};
    insert=function(index, widget){};
    layers=function(){};
    onChangeBounds=function(callback){};
    onChangeCenter=function(callback){};
    onChangeZoom=function(callback){};
    onClick=function(callback){};
    onIdle=function(callback){};
    onTileLoaded=function(callback){};
    remove=function(item){};
    setCenter=function(lon, lat, zoom){};
    setControlVisibility=function(all, layerList, zoomControl, scaleControl, mapTypeControl, fullscreenControl, drawingToolsControl){};
    setGestureHandling=function(option){};
    setLocked=function(locked, minZoom, maxZoom){};
    setOptions=function(mapTypeId, styles, types){};
    setZoom=function(zoom){};
    style=function(){};
    unlisten=function(idOrType){};
    widgets=function(){};
}
class uiPanelLayout{
    constructor(){}
    absolute=function(){};
    flow=function(direction, wrap){};
}
class uiPanel{
    constructor(widgets, layout, style){}
    Layout = new uiPanelLayout();
    add=function(widget){};
    clear=function(){};
    getLayout=function(){};
    insert=function(index, widget){};
    remove=function(widget){};
    setLayout=function(layout){};
    style=function(){};
    widgets=function(){};
}
class uiSelect{
    constructor(items, placeholder, value, onChange, disabled, style){}
    getDisabled=function(){};
    getPlaceholder=function(){};
    getValue=function(){};
    items=function(){};
    onChange=function(callback){};
    setDisabled=function(disabled){};
    setPlaceholder=function(placeholder){};
    setValue=function(value, trigger){};
    style=function(){};
    unlisten=function(idOrType){};
}
class uiSlider{
    constructor(min, max, value, step, onChange, direction, disabled, style){}
    getDisabled=function(){};
    getMax=function(){};
    getMin=function(){};
    getStep=function(){};
    getValue=function(){};
    onChange=function(callback){};
    onSlide=function(callback){};
    setDisabled=function(disabled){};
    setMax=function(value){};
    setMin=function(value){};
    setStep=function(value){};
    setValue=function(value, trigger){};
    style=function(){};
    unlisten=function(idOrType){};
}
class uiSplitPanel{
    constructor(firstPanel, secondPanel, orientation, wipe, style){}
    getFirstPanel=function(){};
    getOrientation=function(){};
    getPanel=function(index){};
    getSecondPanel=function(){};
    getWipe=function(){};
    setFirstPanel=function(panel){};
    setOrientation=function(orientation){};
    setPanel=function(index, panel){};
    setSecondPanel=function(panel){};
    setWipe=function(wipe){};
    style=function(){};
    unlisten=function(idOrType){};
}
class uiTextbox{
    constructor(placeholder, value, onChange, disabled, style){}
    getDisabled=function(){};
    getPlaceholder=function(){};
    getValue=function(){};
    onChange=function(callback){};
    setDisabled=function(disabled){};
    setPlaceholder=function(placeholder){};
    setValue=function(value, trigger){};
    style=function(){};
    unlisten=function(idOrType){};
}
class uiThumbnail{
    constructor(image, params, onClick, style){}
    getImage=function(){};
    getParams=function(){};
    onClick=function(callback){};
    setImage=function(image){};
    setParams=function(params){};
    style=function(){};
    unlisten=function(idOrType){};
}
class uidata{
    constructor(){}
    ActiveDictionary=function(object, allowedProperties){};
    get=function(key){};
    set=function(keyOrDict, value){};
    ActiveList=function(list){};
    add=function(el){};
    forEach=function(callback){};
    get=function(index){};
    getJsArray=function(){};
    insert=function(index, el){};
    length=function(){};
    remove=function(el){};
    reset=function(list){};
    set=function(index, el){};
}
class uiroot{
    constructor(){}
    add=function(widget){};
    clear=function(){};
    getLayout=function(){};
    insert=function(index, widget){};
    onResize=function(callback){};
    remove=function(widget){};
    setKeyHandler=function(keyCode, handler, description){};
    setLayout=function(layout){};
    widgets=function(){};
}
class uiurl{
    constructor(){}
    get=function(key, defaultValue){};
    set=function(keyOrDict, value){};
}
class uiutil{
    constructor(){}
    clear=function(){};
    clearTimeout=function(timeoutKey){};
    debounce=function(func, delay, scope){};
    getCurrentPosition=function(success, error){};
    rateLimit=function(func, delay, scope){};
    setInterval=function(func, delay){};
    setTimeout=function(func, delay){};
    throttle=function(func, delay, scope){};
}
/*
Empty ui Class whose functions expect
the same arguments as in the code editor.
*/
class UIConstructor{
    constructor(){}
    Button = new uiButton();
    Chart = new uiChart();
    Checkbox = new uiCheckbox();
    DateSlider = new uiDateSlider();
    Label = new uiLabel();
    Map = new uiMap();
    Panel = new uiPanel();
    Select = new uiSelect();
    Slider = new uiSlider();
    SplitPanel = new uiSplitPanel();
    Textbox = new uiTextbox();
    Thumbnail = new uiThumbnail();
    root = new uiroot();
    url = new uiurl(); 
    util = new uiutil();
    Key=null;
}
exports.ui = new UIConstructor();

class ChartArrayConstructor{
    constructor(){}
    values=function(array,axis,xLabels){};
}
class ChartFeatureConstructor{
    constructor(){}
    byFeature=function(features,xProperty,yProperties){};
    byProperty=function(features,xProperties,seriesProperty){};
    groups=function(features,xProperty,yProperty,seriesProperty){};
    histogram=function(features,property,maxBuckets,minBucketWidth,maxRaw){};
}
class ChartImageConstructor{
    constructor(){}
    byClass=function(image, classBand, region, reducer, scale, classLabels, xLabels){};
    byRegion=function(image, regions, reducer, scale, xProperty){};
    doySeries=function(imageCollection, region, regionReducer, scale, yearReducer, startDay, endDay){};
    doySeriesByRegion=function(imageCollection, bandName, regions, regionReducer, scale, 
        yearReducer, seriesProperty, startDay, endDay){};
    doySeriesByYear=function(imageCollection, bandName, region, regionReducer, scale, 
        sameDayReducer, startDay, endDay){};
    histogram=function(image, region, scale, maxBuckets, minBucketWidth, maxRaw){};
    regions=function(image, regions, reducer, scale, seriesProperty, xLabels){};
    series=function(imageCollection, region, reducer, scale, xProperty){};
    seriesByRegion=function(imageCollection, regions, reducer, band, scale, xProperty, seriesProperty){};
}
class ChartConstructor{
   /*
   Empty Chart Class whose functions expect
   the same arguments as in the code editor.
   */
  constructor(){}
  array = new ChartArrayConstructor();
  feature = new ChartFeatureConstructor();
  image = new ChartImageConstructor();
  Chart=function(dataTable, chartType, options, view){};
  setChartType=function(chartType){};
  setDataTable=function(dataTable){};
  setOptions=function(options){};
  setSeriesNames=function(seriesNames, seriesIndex){};
  setView=function(view){};
  transform=function(transformer){};
}

exports.Chart = new ChartConstructor();