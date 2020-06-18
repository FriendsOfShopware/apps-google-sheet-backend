import { https } from "firebase-functions";
import {firestore} from 'firebase-admin';
import {Response} from 'express';
import {generateHmac} from './utils';

const ref = firestore().collection('shops');

export async function validateRequest(request: https.Request, response: Response): Promise<boolean>
{
    if (request.headers['shopware-shop-signature'] === undefined) {
        response.status(401);
        response.send(JSON.stringify({success: false, message: 'Request does not contains a hmac'}));
        return false;
    }

    let shopId = getShopIdFromRequest(request);

    if (shopId === null) {
        response.status(401);
        response.send(JSON.stringify({success: false, message: 'Cannot find any shop signature in the request'}));
        return false;
    }

    let data = await getShopData(shopId);

    if (data === null) {
        response.status(401);
        response.send(JSON.stringify({success: false, message: 'Cannot find a shop with the given request'}));
        return false;
    }

    if (request.headers['shopware-shop-signature'] !== generateHmac(request.rawBody.toString(), data.appSecret)) {
        response.status(401);
        response.send(JSON.stringify({success: false, message: 'Invalid hmac given'}));

        return false;
    }

    return true;
}

function getShopIdFromRequest(request: https.Request) : string | null
{
    if (request.body['shopId'] !== undefined) {
        return request.body['shopId'].toString();
    }

    if (request.body.source !== undefined && request.body.source.shopId !== undefined) {
        return request.body.source.shopId.toString();
    }

    return null;
}

async function getShopData(shopId: string): Promise<any|null>
{
    let record = await ref.where('shopwareShopId', '==', shopId).get();

    if (record.empty) {
        return null;
    }

    return record.docs[0].data();
}