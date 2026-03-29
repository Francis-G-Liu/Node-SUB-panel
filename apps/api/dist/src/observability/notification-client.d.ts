export declare class NotificationClient {
    private readonly logger;
    private _transporter?;
    private _transporterKey?;
    private getTransporter;
    sendTelegram(chatId: string, message: string): Promise<void>;
    sendEmail(to: string, subject: string, text: string): Promise<void>;
}
