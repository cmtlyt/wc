import { curry } from '@cmtlyt/base';
import { createEvent } from './create-event';

type ListenerFunc = (this: HTMLElement, entry: CustomEvent<any>) => void;

type GetKey<K> = (K extends `on${infer R}` ? Lowercase<R> : K)|(string & {});

export const FlagKey = Symbol('flag');

export const Flag = {
  disableDomEmit: 1,
  disableCompEmit: 1 << 1,
};

type DispatchFunc<K extends string> = (event: GetKey<K>, detail: any) => void;

export function createDispatch<K extends `on${Capitalize<string>}`>(target: any = null, eventMap: Record<K, ListenerFunc | undefined>) {
  // onAppear -> appear
  // onFristAppear -> fristappear
  const map = Object.fromEntries(Object.entries(eventMap)
    .map(([key, value]) => [key.replace(/^on/, '').toLowerCase(), value]),
  ) as Record<GetKey<K>, ListenerFunc>;
  return curry(((eventName, _detail) => {
    const { [FlagKey]: flag = 0, detail = _detail } = _detail || {};
    const event = createEvent(eventName, detail);
    target && !(flag & Flag.disableDomEmit) && target.dispatchEvent(event);
    map[eventName] && !(flag & Flag.disableCompEmit) && map[eventName].call(target, event);
  }) as DispatchFunc<K>);
}
