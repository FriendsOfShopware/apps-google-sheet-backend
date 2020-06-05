import { https } from "firebase-functions";
import {firestore} from 'firebase-admin';
import {Response} from 'express';
import {generateHmac} from './utils';

const ref = firestore().collection('shops');

export async function validateRequest(request: https.Request, response: Response): Promise<boolean>
{
    if (request.body.hmac === undefined) {
        response.status(401);
        response.send(JSON.stringify({success: false, message: 'Request does not contains a hmac'}));
        return false;
    }

    let url = getShopUrlFromRequest(request);

    if (url === null) {
        response.status(401);
        response.send(JSON.stringify({success: false, message: 'Cannot find any shop signature in the request'}));
        return false;
    }

    console.time();
    let data = await getShopData(url);
    console.timeEnd();

    if (data === null) {
        response.status(401);
        response.send(JSON.stringify({success: false, message: 'Cannot find a shop with the given request'}));
        return false;
    }

    const body = Object.assign({}, request.body);
    delete body.hmac;

    if (request.body.hmac !== generateHmac(JSON.stringify(body), data.appSecret)) {
        response.status(401);
        response.send(JSON.stringify({success: false, message: 'Invalid hmac given'}));

        return false;
    }

    return true;
}

function getShopUrlFromRequest(request: https.Request) : string | null
{
    if (request.query.url !== undefined) {
        return request.query.url.toString();
    }

    if (request.body.source !== undefined && request.body.source.url !== undefined) {
        return request.body.source.url.toString();
    }

    return null;
}

async function getShopData(shopUrl: string): Promise<any|null>
{
    let record = await ref.where('shopUrl', '==', shopUrl).get();

    if (record.empty) {
        return null;
    }

    return record.docs[0].data();
}