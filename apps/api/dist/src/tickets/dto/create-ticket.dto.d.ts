export declare class CreateTicketDto {
    subject: string;
    body: string;
    nodeId?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
}
