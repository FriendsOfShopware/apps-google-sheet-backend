import { region } from "firebase-functions";

import * as admin from 'firebase-admin';

let ref = admin.firestore().collection('shops');

export default region('us-central1').https.onRequest(async (request, response) => {
    if (request.query.shop === undefined) {
        response.send('Invalid Request');
        return;
    }

    let id = await getShopId(request.query.shop.toString());

    if (id === null) {
        response.send('Invalid Requested Shop');
        return;
    }

    ref.doc(id).set({
        apiKey: request.body.apiKey,
        apiSecret: request.body.secretKey
    }, {merge: true});

    response.send({success: true});
});

let getShopId = async (url: string) : Promise<string|null> => {
    let record = await ref.where('shopUrl', '==', url).get();

    if (record.empty) {
        return null;
    }

    return record.docs[0].id;
};