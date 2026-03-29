const encodeQuery = (query) => {
    if (!query)
        return '';
    const search = Object.entries(query)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
    return search ? `?${search}` : '';
};
export class AirportApiClient {
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/$/, '');
        this.defaultHeaders = options.defaultHeaders ?? {};
        this.tokenProvider = options.tokenProvider;
    }
    async resolveToken() {
        if (typeof this.tokenProvider === 'string')
            return this.tokenProvider;
        if (typeof this.tokenProvider === 'function')
            return this.tokenProvider();
        return undefined;
    }
    async request(options) {
        const token = await this.resolveToken();
        const headers = {
            'Content-Type': 'application/json',
            ...this.defaultHeaders,
            ...options.headers,
        };
        if (token)
            headers.Authorization = `Bearer ${token}`;
        const response = await fetch(`${this.baseUrl}${options.path}${encodeQuery(options.query)}`, {
            method: options.method ?? 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        if (!response.ok) {
            const text = await response.text();
            const error = new Error(`Request failed ${response.status}: ${text}`);
            error.status = response.status;
            error.statusCode = response.status;
            throw error;
        }
        if (response.status === 204) {
            return undefined;
        }
        return (await response.json());
    }
}
export class AdminApi extends AirportApiClient {
    listNodes(query) {
        return this.request({ path: '/api/nodes', query });
    }
    getNodeMetrics(id) {
        return this.request({ path: `/api/nodes/${id}/metrics` });
    }
    listProviders() {
        return this.request({ path: '/api/providers' });
    }
    syncProvider(providerId) {
        return this.request({ path: `/api/providers/${providerId}/sync`, method: 'POST' });
    }
    // --- Plans ---
    listPlans() {
        return this.request({ path: '/api/plans' });
    }
    createPlan(data) {
        return this.request({ path: '/api/plans', method: 'POST', body: data });
    }
    updatePlan(id, data) {
        return this.request({ path: `/api/plans/${id}`, method: 'PATCH', body: data });
    }
    deletePlan(id) {
        return this.request({ path: `/api/plans/${id}`, method: 'DELETE' });
    }
    // --- Subscriptions ---
    listSubscriptions() {
        return this.request({ path: '/api/subscriptions' });
    }
    createSubscription(data) {
        return this.request({ path: '/api/subscriptions', method: 'POST', body: data });
    }
    updateSubscription(id, data) {
        return this.request({ path: `/api/subscriptions/${id}`, method: 'PATCH', body: data });
    }
    deleteSubscription(id) {
        return this.request({ path: `/api/subscriptions/${id}`, method: 'DELETE' });
    }
    listUsers(query) {
        return this.request({ path: '/api/users', query });
    }
    listTickets(query) {
        return this.request({ path: '/api/tickets', query });
    }
    listAlerts() {
        return this.request({ path: '/api/alerts' });
    }
    triggerAlert(id, message) {
        return this.request({ path: `/api/alerts/${id}/trigger`, method: 'POST', body: { message } });
    }
    getMe() {
        return this.request({ path: '/api/me' });
    }
    listAuditLogs(query) {
        return this.request({ path: '/api/audit-logs', query });
    }
    listCategories() {
        return this.request({ path: '/api/categories' });
    }
    replyTicket(id, content) {
        return this.request({ path: `/api/tickets/${id}/reply`, method: 'POST', body: { content } });
    }
}
export class AppApi extends AirportApiClient {
    me() {
        return this.request({ path: '/api/me' });
    }
    listAvailableNodes() {
        return this.request({ path: '/api/user/nodes' });
    }
    listTickets() {
        return this.request({ path: '/api/user/tickets' });
    }
    createTicket(payload) {
        return this.request({ path: '/api/user/tickets', method: 'POST', body: payload });
    }
}
