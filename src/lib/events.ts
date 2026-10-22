import { EventEmitter } from 'events';

// Kept on globalThis so route handlers and the WS handler share one emitter
const globalForEvents = globalThis as typeof globalThis & { eatitEvents?: EventEmitter };
const emitter = (globalForEvents.eatitEvents ??= new EventEmitter());
emitter.setMaxListeners(200);

export function emitOrderEvent(orderHash: string) {
  emitter.emit(`order:${orderHash}`);
}

export function onOrderEvent(
  orderHash: string,
  callback: () => void
): () => void {
  emitter.on(`order:${orderHash}`, callback);
  return () => {
    emitter.off(`order:${orderHash}`, callback);
  };
}
