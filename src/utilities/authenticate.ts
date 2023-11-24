/* eslint-disable @typescript-eslint/naming-convention */
/*
Authentication to Google Earth Engine
using the loopback oauth2 flow:
https://developers.google.com/identity/protocols/oauth2/native-app#redirect-uri_loopback

Adapted from the github-authentication extension* 
https://github.com/microsoft/vscode/blob/main/extensions/github-authentication

* Copyright (c) Microsoft Corporation, see:
https://github.com/microsoft/vscode/blob/main/LICENSE.txt
*/
import * as path from 'path';
import * as vscode from 'vscode';
import { SecretStorage } from "vscode";
import { getTokenFromCredentials, validateToken } from '../utilities/getToken';
import { LoopbackAuthServer } from './loopbackAuthServer';

const TIMED_OUT_ERROR = "Timed out.";
const USER_CANCELLATION_ERROR = "User cancelled.";

const GEE_AUTH_ID = "517222506229-vsmmajv00ul0bs7p89v5m89qs8eb9359"+
".apps.googleusercontent.com";
const GEE_AUTH_SECRET = "RUP0RZ6e0pPhDzsqIJ7KlNd1";

const SCOPES = "https://www.googleapis.com/auth/userinfo.email "+
"https://www.googleapis.com/auth/earthengine "+
"https://www.googleapis.com/auth/devstorage.full_control";
const baseUri = vscode.Uri.from({
    scheme: "https", 
    authority: "accounts.google.com",
    path: "/o/oauth2/auth"
});


/*
🔲 TODO:
    - accountPicker but only signedInAccounts.
    - on picked, erase account from secrets.store
    and from signedInAccounts (globalState store)
*/
export function signout(){
// TODO
}

export async function signin(context: vscode.ExtensionContext){
    try{
        const authResponse =  await authorizationCode();    
        const exchangeResponse:any = await exchangeCodeForToken(authResponse);
        if ("access_token" in exchangeResponse){
            const validation:any|null = await validateToken(exchangeResponse.access_token);
            if(validation){
                if("email" in validation){
                    const accountName = validation.email;
                    const token = validation.token;
                    const refreshToken = exchangeResponse.refresh_token;
                    let extensionState = context.globalState;
                    const account = {
                        kind: "signedIn",
                        token: token
                    };
                    let accounts:any = extensionState.get("signedInAccounts");
                    if (!accounts){
                        accounts={}; 
                    }
                    // Add account to extension state (store: signedInAccounts)
                    accounts[accountName]=account;
                    extensionState.update("signedInAccounts", accounts);
                    const secrets: SecretStorage = context.secrets;
                    // Save refresh token as a secret:
                    secrets.store(accountName, refreshToken);
                    vscode.window.showInformationMessage("You are now signed in.");
                }
            }
        }
    }catch(e:any){
        console.log("EE tasks: sign in failed: " + e);
        vscode.window.showErrorMessage(
            "Sign in to accounts.google.com failed: \n " + e);
    }
}

/*
This is the main flow for getting an authorization code
from accounts.google.com:
- A vscode.window.withProgress shows the user a message
that we are signing in to accounts.google.com, with the 
possibility to cancel the process using a Cancel button.
- A local http server (http://172.0.0.1) will start 
in a port. The server has three paths: /, /signin, and /callback
- Vscode will open (in a browser) the server to the /signin path, 
which will redirect the user to: https://accounts.google.com/o/oauth2/auth
with a redirect_uri looping back to the local server to the
/callback path, also including a random number (nonce) to verify 
the response.
    - If the user signs in to a google account and allows
    the Google Earth Engine Authenticator by clicking the
    Allow button, it will finally loop back to the /callback
    path in the local server.
    - Upon entering the /callback path, the local server
    verifies that the response contains the correct "nonce".
    - If the response is ok, it retrieves the authorization
    code, and finally redirect to the '/' path.
    - The '/' path serves a local static html file 
    found in /media/index.html which displays the message
    "You are signed in now and can close this page."
    - The server stops automatically after 5 minutes, 
    or when the user Cancels the process, or when the
    authorization code is retrieved.
- The function returns a Promise that resolves to
{code: string, port: number}
or rejects with an error. 
*/
interface IAuthResponse{
    code:string,
    port:number,
    nonce:string
}
async function authorizationCode(
): Promise<IAuthResponse> {
	return await vscode.window.withProgress<IAuthResponse>({
		location: vscode.ProgressLocation.Notification,
		title: "Signing in to accounts.google.com",
		cancellable: true
	}, async (_, cancellationToken) => {
		const searchParams = new URLSearchParams([
			['client_id', GEE_AUTH_ID],
               ['response_type', 'code'],
			['scope', SCOPES],
		]);
		const loginUrl = baseUri.with({
			path: '/o/oauth2/auth',
			query: searchParams.toString()
		});
		const server = new LoopbackAuthServer(path.join(__dirname, '../media'), loginUrl.toString(true));
		const port = await server.start();
		let codeToExchange;
		try {
			vscode.env.openExternal(
                   vscode.Uri.parse(
                       `http://127.0.0.1:${port}/signin?nonce=${encodeURIComponent(server.nonce)}`
                       ));
			const { code } = await Promise.race([
                   // Response from server:
				server.waitForOAuthResponse(),
                   // Timeout after 5 min:
				new Promise<any>((_, reject) => 
                       setTimeout(() => reject(TIMED_OUT_ERROR), 
                       300_000)), 
                   // User pressed the cancel button on the notification:
                   new Promise<any>((_, reject)=>
                   cancellationToken.onCancellationRequested(()=>{
                       reject(USER_CANCELLATION_ERROR);
                   })
                   )
			]);
			codeToExchange = code;
		} finally {
            console.log("EE Tasks loopback auth server stopped.");
			setTimeout(() => {
				void server.stop();
			}, 5000);
		}
    return {code: codeToExchange, port: port, nonce: server.nonce};
});
}

/*
Sends a POST request to exchange the authorization code for a token
Returns a Promise that resolves to:
{access_token: string, expires_in: number, refresh_token: string,
scope: string, token_type: 'Bearer'}
or rejects the promise with the error.
See:
https://developers.google.com/identity/protocols/oauth2/native-app#exchange-authorization-code
*/
function exchangeCodeForToken(authResponse: IAuthResponse){
    return getTokenFromCredentials({
        code: authResponse.code,
        redirect_uri: `http://localhost:${authResponse.port}/callback?nonce=${authResponse.nonce}`,
        client_id: GEE_AUTH_ID,
        client_secret: GEE_AUTH_SECRET,
        grant_type: "authorization_code"
    });
}