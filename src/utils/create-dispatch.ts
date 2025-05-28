import { createEvent } from './create-event';

type ListenerFunc = (this: HTMLElement, entry: CustomEvent<any>) => void;

type GetKey<K> = K extends `on${infer R}` ? Lowercase<R> : K;

type DispatchFunc<K extends string> = (event: GetKey<K>, detail: any) => void;

export function createDispatch<K extends `on${Capitalize<string>}`>(target: any, eventMap: Record<K, ListenerFunc | undefined>): DispatchFunc<K> {
  // onAppear -> appear
  // onFristAppear -> fristappear
  const map = Object.fromEntries(Object.entries(eventMap)
    .map(([key, value]) => [key.replace(/^on/, '').toLowerCase(), value]),
  ) as Record<GetKey<K>, ListenerFunc>;
  return (eventName, detail) => {
    const event = createEvent(eventName, detail);
    target.dispatchEvent(event);
    map[eventName] && map[eventName].call(target, event);
  };
}
