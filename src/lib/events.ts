import { EventEmitter } from 'events';

const emitter = new EventEmitter();
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
