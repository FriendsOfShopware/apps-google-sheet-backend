import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

export function randomString()
{
    let f = () => Math.random().toString(36).substring(2);

    return f() + f();
}

export function generateHmac(content : string, secret: string): string
{
    return crypto.createHmac('sha256', secret)
        .update(content)
        .digest('hex');
}


export async function getShopId(shopwareShopId : string): Promise<string|null>
{
    let record = await getShopRef().where('shopwareShopId', '==', shopwareShopId).get();

    if (record.empty) {
        return null;
    }

    return record.docs[0].id;
}


function getShopRef()
{
    return admin.firestore().collection('shops');
}