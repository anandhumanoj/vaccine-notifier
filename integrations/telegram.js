import TelegramBot from "node-telegram-bot-api";
import TurndownService from 'turndown'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

const chatId = process.env.TELEGRAM_CHAT_ID;

export function sendNotification(message, options = {}) {
    var turndownService = new TurndownService()
    message = turndownService.turndown(message)
    bot.sendMessage(chatId, message, options);
}