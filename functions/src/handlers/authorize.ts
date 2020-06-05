import { region } from "firebase-functions";

import * as admin from 'firebase-admin';
import {randomString, getShopId, generateHmac} from '../utils';
import {APP_NAME, APP_SECRET} from '../consts';

let ref = admin.firestore().collection('shops');

export default region('us-central1').https.onRequest(async (request, response) => {
    if (request.query.shop === undefined || request.query.hmac === undefined) {
        response.send('Invalid Request');
        return;
    }

    const shopUrl = request.query.shop.toString();

    let shopDocumentId = await getShopId(shopUrl);

    let data = {
        shopUrl: shopUrl,
        appSecret: randomString()
    };

    if (shopDocumentId) {
        await ref.doc(shopDocumentId).set(data);
    } else {
        await ref.add(data);
    }

    response.send(JSON.stringify({
        proof: generateHmac(shopUrl + APP_NAME, APP_SECRET),
        secret: data.appSecret,
        confirmation_url: 'https://sheet.fos.gg/api/v1/auth_callback?url=' + shopUrl
    }));
});