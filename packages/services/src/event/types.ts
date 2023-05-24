export type EventHandler = (data?: unknown) => unknown;
export type EventName = "login" | "identityChanged" | "logout";
export type Events = Record<EventName, EventHandler>;
