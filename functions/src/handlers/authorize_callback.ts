import { region } from "firebase-functions";
import * as admin from 'firebase-admin';
import {validateRequest} from '../security';
import {getShopId} from '../utils';

let ref = admin.firestore().collection('shops');

export default region('us-central1').https.onRequest(async (request, response) => {
    if (!(await validateRequest(request, response))) {
        return;
    }

    if (request.body['shopId'] === undefined) {
        response.send('Invalid Request');
        return;
    }

    let id = await getShopId(request.body['shopId'].toString());

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