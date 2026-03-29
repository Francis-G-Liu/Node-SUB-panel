"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var NotificationClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationClient = void 0;
const common_1 = require("@nestjs/common");
const nodemailer_1 = __importDefault(require("nodemailer"));
let NotificationClient = NotificationClient_1 = class NotificationClient {
    logger = new common_1.Logger(NotificationClient_1.name);
    _transporter;
    _transporterKey;
    getTransporter() {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT ?? 587);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        if (!host || !user || !pass)
            return null;
        const key = `${host}:${port}:${user}`;
        if (this._transporter && this._transporterKey === key)
            return this._transporter;
        this._transporter = nodemailer_1.default.createTransport({
            host,
            port,
            secure: false,
            auth: { user, pass },
        });
        this._transporterKey = key;
        return this._transporter;
    }
    async sendTelegram(chatId, message) {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            this.logger.warn('TELEGRAM_BOT_TOKEN not set');
            return;
        }
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message }),
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`telegram send failed: ${response.status} ${text}`);
        }
    }
    async sendEmail(to, subject, text) {
        const from = process.env.SMTP_FROM ?? 'noreply@airport.dev';
        const transporter = this.getTransporter();
        if (!transporter) {
            this.logger.warn('SMTP not configured');
            return;
        }
        await transporter.sendMail({ from, to, subject, text });
    }
};
exports.NotificationClient = NotificationClient;
exports.NotificationClient = NotificationClient = NotificationClient_1 = __decorate([
    (0, common_1.Injectable)()
], NotificationClient);
//# sourceMappingURL=notification-client.js.map