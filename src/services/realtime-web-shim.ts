export class RealtimeClient {
  constructor(_url?: string, _options?: unknown) {}
  channel() { return { subscribe: () => this, unsubscribe: () => this, on: () => this, send: () => this }; }
  getChannels() { return []; }
  removeChannel() { return Promise.resolve('ok'); }
  removeAllChannels() { return Promise.resolve(['ok']); }
  disconnect() {}
  connect() {}
  setAuth(_token?: string) {}
}
export class RealtimeChannel {}
export class RealtimePresence {}
export const REALTIME_LISTEN_TYPES = {};
export const REALTIME_SUBSCRIBE_STATES = {};
export const REALTIME_PRESENCE_LISTEN_EVENTS = {};
export const REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {};
