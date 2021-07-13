import sdk from 'matrix-js-sdk'

var client = null;

const withConnection = async (config, callback, ...args) => {
    if(!client){
        client = sdk.createClient({
            baseUrl: "https://matrix.org",
            accessToken: config.matrix_access_token,
            userId: config.matrix_user_id
        });
    }
    return callback(config, ...args);
}

const sendNotificationImpl = async (config, message) => {
    var roomId = config.matrix_room_id;

    const notificationContent = {
        "body": message,
        "msgtype": "m.text",
        "format": "org.matrix.custom.html",
        "formatted_body": message
    }
    return client.sendEvent(roomId, "m.room.message", notificationContent, "");
}

const sendNotification = 
    async (message, config) => withConnection(config, sendNotificationImpl, message);

export {
    sendNotification
};
