export interface Node {
  id: string;
  protocol: string;
  host: string;
  port: number;
  region: string;
  status: 'online' | 'offline';
  active: boolean;
  latency: number;
  packetLoss: number;
  tags: string[];
}

export interface Provider {
  id: string;
  name: string;
  url: string;
  region: string;
  interval: number;
  lastSync: string;
  tags: string[];
  yamlContent?: string;
}

export interface Plan {
  id: string;
  name: string;
  limit: number;
  days: number;
  devices: number;
  rules: string;
}

export interface Subscription {
  id: string;
  user: string;
  plan: string;
  status: 'Active' | 'Expired' | 'Suspended';
  used: number;
  total: number;
  expiry: string;
}

export interface TicketMessage {
  id: string;
  sender: string;
  role: 'user' | 'support';
  content: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'Pending' | 'Resolved';
  node: string;
  createdAt: string;
  messages?: TicketMessage[];
}

export interface Alert {
  id: string;
  name: string;
  channel: string;
  severity: 'Warning' | 'Critical';
  threshold: string;
  target: string;
  active: boolean;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  role: 'super_admin' | 'ops' | 'support' | 'auditor' | 'user';
  status: 'Active' | 'Banned';
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  targetType: string;
  targetId: string;
  time: string;
}

export interface Stats {
  totalNodes: number;
  onlineNodes: number;
  activeSubs: number;
  pendingTickets: number;
}
