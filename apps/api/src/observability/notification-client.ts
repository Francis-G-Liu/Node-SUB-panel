import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Fix #7: cache transporter as singleton keyed by SMTP config hash
// so we don't create a new connection on every alert dispatch.
@Injectable()
export class NotificationClient {
  private readonly logger = new Logger(NotificationClient.name);
  private _transporter?: Transporter;
  private _transporterKey?: string;

  /** Returns a cached SMTP transporter, recreating only when config changes. */
  private getTransporter(): Transporter | null {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) return null;

    const key = `${host}:${port}:${user}`;
    if (this._transporter && this._transporterKey === key)
      return this._transporter;

    this._transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
    this._transporterKey = key;
    return this._transporter;
  }

  async sendTelegram(chatId: string, message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set');
      return;
    }
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message }),
      },
    );
    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`telegram send failed: ${response.status} ${text}`);
    }
  }

  async sendEmail(to: string, subject: string, text: string) {
    const from = process.env.SMTP_FROM ?? 'noreply@airport.dev';
    const transporter = this.getTransporter();
    if (!transporter) {
      this.logger.warn('SMTP not configured');
      return;
    }
    await transporter.sendMail({ from, to, subject, text });
  }
}
