import sdk from 'matrix-js-sdk'

var client = null;

const withConnection = async (callback, ...args) => {
    client = sdk.createClient({
        baseUrl: "https://matrix.org",
        accessToken: process.env.MATRIX_ACCESS_TOKEN,
        userId: process.env.MATRIX_USER_ID
    });
    console.log('Executing ', callback, args);
    await callback(...args);
}

const sendNotificationImpl = async (message) => {
    var roomId = process.env.MATRIX_TARGET_ROOM_ID;

    const notificationContent = {
        "body": message,
        "msgtype": "m.text"
    }

    await client.sendEvent(roomId, "m.room.message", notificationContent, "").then((res) => {
        console.log("Notification sent successfully. Here is the response from matrix:", res);
    }).catch((err) => {
        console.log("Couldn't sent notification, error:", err);
    });
}

const sendNotification = (message) => withConnection(sendNotificationImpl,message)

export {
    sendNotification
}