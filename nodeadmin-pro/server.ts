import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  let nodes = [
    { id: "1", protocol: "vmess", host: "hk-01.node.com", port: 443, region: "HK", status: "online", active: true, latency: 45, packetLoss: 0.1, tags: ["Premium", "Low Latency"] },
    { id: "2", protocol: "vless", host: "us-01.node.com", port: 443, region: "US", status: "online", active: true, latency: 160, packetLoss: 0.5, tags: ["Standard"] },
    { id: "3", protocol: "trojan", host: "jp-01.node.com", port: 443, region: "JP", status: "offline", active: false, latency: 0, packetLoss: 100, tags: ["Maintenance"] },
    { id: "4", protocol: "ss", host: "sg-01.node.com", port: 8388, region: "SG", status: "online", active: true, latency: 65, packetLoss: 0.2, tags: ["Gaming"] },
  ];

  let providers = [
    { id: "1", name: "CloudFlare Workers", url: "https://api.cloudflare.com", region: "Global", interval: 60, lastSync: "2024-03-24 10:00", tags: ["Free"] },
    { id: "2", name: "DigitalOcean", url: "https://api.digitalocean.com", region: "US/EU", interval: 30, lastSync: "2024-03-24 10:15", tags: ["Paid"] },
  ];

  let plans = [
    { id: "1", name: "Basic Plan", limit: 100, days: 30, devices: 2, rules: "Region: US, JP" },
    { id: "2", name: "Premium Plan", limit: 1000, days: 30, devices: 5, rules: "All Regions" },
  ];

  let subscriptions = [
    { id: "1", user: "user1@example.com", plan: "Premium Plan", status: "Active", used: 450, total: 1000, expiry: "2024-04-24" },
    { id: "2", user: "user2@example.com", plan: "Basic Plan", status: "Expired", used: 100, total: 100, expiry: "2024-03-20" },
  ];

  let tickets = [
    { 
      id: "1", 
      subject: "Connection timeout in HK", 
      priority: "High", 
      status: "Open", 
      node: "hk-01.node.com", 
      createdAt: "2024-03-24 09:00",
      messages: [
        { id: "m1", sender: "user1@example.com", role: "user", content: "I can't connect to the HK node. It keeps timing out.", timestamp: "2024-03-24 09:00" },
        { id: "m2", sender: "Support", role: "support", content: "We are looking into it. Please try again in 5 minutes.", timestamp: "2024-03-24 09:05" }
      ]
    },
    { 
      id: "2", 
      subject: "Speed issue in US", 
      priority: "Medium", 
      status: "Pending", 
      node: "us-01.node.com", 
      createdAt: "2024-03-24 08:30",
      messages: [
        { id: "m3", sender: "user2@example.com", role: "user", content: "The speed is very slow in the US region.", timestamp: "2024-03-24 08:30" }
      ]
    },
  ];

  let alerts = [
    { id: "1", name: "High Latency HK", channel: "Telegram", severity: "Warning", threshold: "Latency > 100ms", target: "Region: HK", active: true },
    { id: "2", name: "Node Offline", channel: "Email", severity: "Critical", threshold: "Status == offline", target: "All", active: true },
  ];

  let users = [
    { id: "1", email: "admin@example.com", nickname: "SuperAdmin", role: "super_admin", status: "Active" },
    { id: "2", email: "ops@example.com", nickname: "Operator", role: "ops", status: "Active" },
    { id: "3", email: "user@example.com", nickname: "RegularUser", role: "user", status: "Banned" },
  ];

  let auditLogs = [
    { id: "1", user: "admin@example.com", action: "Sync Provider", targetType: "Provider", targetId: "1", time: "2024-03-24 10:00:05" },
    { id: "2", user: "ops@example.com", action: "Edit Node", targetType: "Node", targetId: "2", time: "2024-03-24 09:45:12" },
  ];

  // API Routes
  app.get("/api/stats", (req, res) => {
    res.json({
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(n => n.status === "online").length,
      activeSubs: subscriptions.filter(s => s.status === "Active").length,
      pendingTickets: tickets.filter(t => t.status !== "Resolved").length,
    });
  });

  app.get("/api/nodes", (req, res) => res.json(nodes));
  app.get("/api/providers", (req, res) => res.json(providers));
  app.get("/api/plans", (req, res) => res.json(plans));
  app.get("/api/subscriptions", (req, res) => res.json(subscriptions));
  app.get("/api/tickets", (req, res) => res.json(tickets));
  app.get("/api/alerts", (req, res) => res.json(alerts));
  app.get("/api/users", (req, res) => res.json(users));
  app.get("/api/audit-logs", (req, res) => res.json(auditLogs));
  
  // Generic CRUD
  app.delete("/api/:resource/:id", (req, res) => {
    const { resource, id } = req.params;
    let list: any[] | null = null;
    
    if (resource === "nodes") list = nodes;
    else if (resource === "providers") list = providers;
    else if (resource === "plans") list = plans;
    else if (resource === "subscriptions") list = subscriptions;
    else if (resource === "tickets") list = tickets;
    else if (resource === "alerts") list = alerts;
    else if (resource === "users") list = users;

    if (list) {
      const index = list.findIndex(item => item.id === id);
      if (index !== -1) {
        list.splice(index, 1);
        return res.json({ message: "Deleted successfully" });
      }
    }
    res.status(404).json({ error: "Not found" });
  });

  app.post("/api/:resource", (req, res) => {
    const { resource } = req.params;
    const item = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    
    if (resource === "nodes") nodes.push(item);
    else if (resource === "providers") providers.push(item);
    else if (resource === "plans") plans.push(item);
    else if (resource === "subscriptions") subscriptions.push(item);
    else if (resource === "tickets") tickets.push(item);
    else if (resource === "alerts") alerts.push(item);
    else if (resource === "users") users.push(item);
    else return res.status(400).json({ error: "Invalid resource" });

    res.json(item);
  });

  app.patch("/api/:resource/:id", (req, res) => {
    const { resource, id } = req.params;
    let list: any[] | null = null;
    
    if (resource === "nodes") list = nodes;
    else if (resource === "providers") list = providers;
    else if (resource === "plans") list = plans;
    else if (resource === "subscriptions") list = subscriptions;
    else if (resource === "tickets") list = tickets;
    else if (resource === "alerts") list = alerts;
    else if (resource === "users") list = users;

    if (list) {
      const index = list.findIndex(item => item.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...req.body };
        return res.json(list[index]);
      }
    }
    res.status(404).json({ error: "Not found" });
  });

  app.post("/api/providers/:id/sync", (req, res) => {
    const provider = providers.find(p => p.id === req.params.id);
    if (provider) {
      provider.lastSync = new Date().toISOString().replace('T', ' ').substring(0, 19);
      res.json({ message: "Sync started" });
    } else {
      res.status(404).json({ error: "Provider not found" });
    }
  });

  app.post("/api/tickets/:id/reply", (req, res) => {
    const ticket = tickets.find(t => t.id === req.params.id);
    if (ticket) {
      const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: "Support",
        role: "support",
        content: req.body.content,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      if (!ticket.messages) ticket.messages = [];
      ticket.messages.push(newMessage);
      res.json(newMessage);
    } else {
      res.status(404).json({ error: "Ticket not found" });
    }
  });

  app.get("/api/nodes/:id/metrics", (req, res) => {
    const data = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      latency: Math.floor(Math.random() * 100) + 20,
      packetLoss: Math.random() * 2,
    }));
    res.json(data);
  });

  // SSE Streams
  app.get("/api/stream/nodes", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const interval = setInterval(() => {
      const node = nodes[Math.floor(Math.random() * nodes.length)];
      const event = {
        time: new Date().toLocaleTimeString(),
        node: node.host,
        action: Math.random() > 0.5 ? "Online" : "Offline",
      };
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }, 5000);

    req.on("close", () => clearInterval(interval));
  });

  app.get("/api/stream/alerts", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const interval = setInterval(() => {
      const alert = alerts[Math.floor(Math.random() * alerts.length)];
      const event = {
        time: new Date().toLocaleTimeString(),
        name: alert.name,
        severity: alert.severity,
      };
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }, 8000);

    req.on("close", () => clearInterval(interval));
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
