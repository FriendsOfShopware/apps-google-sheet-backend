import { region } from "firebase-functions";

import * as admin from 'firebase-admin';
import {randomString, getShopId, generateHmac} from '../utils';
import {APP_NAME, APP_SECRET, AUTH_CALLBACK_URL} from '../consts';

let ref = admin.firestore().collection('shops');

export default region('us-central1').https.onRequest(async (request, response) => {
    if (
        request.query['shop-url'] === undefined || 
        request.headers['shopware-app-signature'] === undefined || 
        request.query['shop-id'] === undefined) {
        response.send('Invalid Request');
        return;
    }

    const shopUrl = request.query['shop-url'].toString();
    const shopId = request.query['shop-id'].toString();

    let shopDocumentId = await getShopId(shopId);

    let data = {
        shopwareShopId: shopId,
        shopUrl: shopUrl,
        appSecret: randomString()
    };

    if (shopDocumentId) {
        await ref.doc(shopDocumentId).set(data);
    } else {
        await ref.add(data);
    }

    response.send(JSON.stringify({
        proof: generateHmac(shopId + shopUrl + APP_NAME, APP_SECRET),
        secret: data.appSecret,
        confirmation_url: AUTH_CALLBACK_URL
    }));
});