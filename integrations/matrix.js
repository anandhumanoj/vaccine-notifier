import sdk from 'matrix-js-sdk'

var client = null;

const withConnection = (callback, ...args) => {
    client = sdk.createClient({
        baseUrl: "https://matrix.org",
        accessToken: process.env.MATRIX_ACCESS_TOKEN,
        userId: process.env.MATRIX_USER_ID
    });
    client.startClient();
    var clientState = '';
    client.once('sync', (state, prevState, res) => {
        console.log("Matrix client sync state updated. New state:", state); 
        clientState = state;
    });
    if (clientState == "PREPARED" && typeof callback == 'function'){
        callback(...args);
    }
}

const sendNotificationImpl = (message) => {
    var roomId = process.env.MATRIX_TARGET_ROOM_ID;

    const notificationContent = {
        "body": message,
        "msgtype": "m.text"
    }

    client.sendEvent(roomId, "m.room.message", notificationContent, "").then((res) => {
        console.log("Notification sent successfully. Here is the response from matrix:", response);
    }).catch((err) => {
        console.log("Couldn't sent notification, error:", err);
    });
}

const sendNotification = (message) => withConnection(sendNotificationImpl,message)

export {
    sendNotification
}