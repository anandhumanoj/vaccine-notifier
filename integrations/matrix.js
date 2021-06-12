import sdk from 'matrix-js-sdk'

const client = null;

const connectClient = () => {
    client = sdk.createClient({
        baseUrl: "https://matrix.org",
        accessToken: process.env.MATRIX_ACCESS_TOKEN,
        userId: process.env.MATRIX_USER_ID
    });
}

const sendNotification = (message) => {
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

export {
    sendNotification
}