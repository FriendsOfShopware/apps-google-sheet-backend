const crypto = require('crypto');
import { region } from "firebase-functions";

import * as admin from 'firebase-admin';
admin.initializeApp();

const appName = 'FroshGoogleSheet';
const appSecret = 'frosh';


let ref = admin.firestore().collection('shops');

export default region('us-central1').https.onRequest(async (request, response) => {
    if (request.query.shop === undefined || request.query.hmac === undefined) {
        response.send('Invalid Request');
        return;
    }

    let shopDocumentId = await isShopRegisteded(request.query.shop.toString());

    let data = {
        shopUrl: request.query.shop
    };

    if (shopDocumentId) {
        await ref.doc(shopDocumentId).set(data);
    } else {
        await ref.add(data);
    }

    let hmac = generateHmac(request.query.shop.toString());

    response.send(JSON.stringify({
        proof: hmac,
        secret: appSecret,
        confirmation_url: 'https://sheet.apps.friendsofshopware.com/api/v1/auth_callback?shop=' + request.query.shop.toString()
    }));
});

let isShopRegisteded = async (url: string) : Promise<string|null> => {
    let record = await ref.where('shopUrl', '==', url).get();

    if (record.empty) {
        return null;
    }

    return record.docs[0].id;
};

let generateHmac = (url: string) => {
    return crypto.createHmac('sha256', appSecret)
        .update(url + appName)
        .digest('hex');
}