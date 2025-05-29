import { noop } from '@cmtlyt/base';
import { createEvent } from './create-event';

export type ListenerEvent = CustomEvent<IntersectionObserverEntry>;

export type ListenerFunc = (this: HTMLElement, entry: ListenerEvent) => void;

export interface Listener {
  appear: ListenerFunc;
  disappear?: ListenerFunc;
}

const entryCbsMap = new WeakMap<HTMLElement, Listener>();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const dom = entry.target as HTMLElement;
    const { appear, disappear } = entryCbsMap.get(dom)!;
    if (entry.isIntersecting) {
      appear.call(dom, createEvent('appear', entry));
    }
    else {
      disappear && disappear.call(dom, createEvent('disappear', entry));
    }
  });
});

export function observe(dom: HTMLElement | undefined, cb: Listener | ListenerFunc) {
  if (!dom)
    return noop;
  if (typeof cb === 'function') {
    cb = { appear: cb };
  }
  entryCbsMap.set(dom, cb);
  observer.observe(dom);

  return () => unObserve(dom);
}

export function unObserve(dom: HTMLElement | undefined) {
  if (!dom)
    return;
  observer.unobserve(dom);
  entryCbsMap.delete(dom);
}
