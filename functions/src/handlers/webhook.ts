import { region } from "firebase-functions";

export default region('us-central1').https.onRequest(async (request, response) => {
    console.log(JSON.stringify(request.body));
    console.log(JSON.stringify(request.query));
    console.log(request.rawBody);
    response.send('Yea');
});