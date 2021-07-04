import TelegramBot from "node-telegram-bot-api";
import TurndownService from 'turndown'

export function sendNotification(message, config) {
    const bot = new TelegramBot(config.telegram_bot_token);
    const chatId = config.telegram_chat_id;

    var turndownService = new TurndownService()
    message = turndownService.turndown(message)
    bot.sendMessage(chatId, message, options);
}