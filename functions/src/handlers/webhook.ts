import { region } from "firebase-functions";
import {validateRequest} from '../security';

export default region('us-central1').https.onRequest(async (request, response) => {
    if (!(await validateRequest(request, response))) {
        response.status(401);
        response.send(JSON.stringify({success: false, message: 'Cannot handle Webhook for that Shop'}));
        return;
    }

    response.send(JSON.stringify({success: true}));
});