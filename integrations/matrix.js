import sdk from 'matrix-js-sdk'

var client = null;

const withConnection = async (callback, ...args) => {
    client = sdk.createClient({
        baseUrl: "https://matrix.org",
        accessToken: process.env.MATRIX_ACCESS_TOKEN,
        userId: process.env.MATRIX_USER_ID
    });
    console.log('Executing ', callback, args);
    return callback(...args);
}

const sendNotificationImpl = async (message) => {
    var roomId = process.env.MATRIX_TARGET_ROOM_ID;

    const notificationContent = {
        "body": message,
        "msgtype": "m.text",
        "format": "org.matrix.custom.html",
        "formatted_body": message
    }
    return client.sendEvent(roomId, "m.room.message", notificationContent, "");
}

const sendNotification = async (message) => withConnection(sendNotificationImpl,message)

export {
    sendNotification
}
