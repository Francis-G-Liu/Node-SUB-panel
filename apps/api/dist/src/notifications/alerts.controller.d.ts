import { NotificationsService } from './notifications.service';
export declare class AlertsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(): Promise<{
        id: any;
        name: any;
        channel: any;
        severity: any;
        threshold: string;
        target: any;
        active: boolean;
    }[]>;
    trigger(id: string, message: string): Promise<{
        status: string;
    }>;
}
