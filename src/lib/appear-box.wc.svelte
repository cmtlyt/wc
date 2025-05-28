<svelte:options customElement='appear-box' />

<script module lang='ts'>
  import { createEvent } from '../utils/create-event';

  type ListenerFunc = (this: HTMLElement, entry: CustomEvent<IntersectionObserverEntry>) => void;

  interface Listener {
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

  function observe(dom: HTMLElement | undefined, cb: Listener | ListenerFunc) {
    if (!dom)
      return;
    if (typeof cb === 'function') {
      cb = { appear: cb };
    }
    entryCbsMap.set(dom, cb);
    observer.observe(dom);
  }

  function unObserve(dom: HTMLElement | undefined) {
    if (!dom)
      return;
    observer.unobserve(dom);
    entryCbsMap.delete(dom);
  }
</script>

<script lang='ts'>
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { onMount } from 'svelte';
  import { createDispatch } from '../utils/create-dispatch';
  import { pt } from '../utils/props-transform';

  const _props: {
    onAppear?: ListenerFunc;
    onFirstAppear?: ListenerFunc;
    onDisappear?: ListenerFunc;
    onFirstDisappear?: ListenerFunc;
  } & SvelteHTMLElements['section'] = $props();

  const { onAppear, onFirstAppear, onDisappear, onFirstDisappear, rest } = pt(_props, [
    'onAppear|function',
    'onFirstAppear|function',
    'onDisappear|function',
    'onFirstDisappear|function',
  ] as const, ['id']);

  const triggerInfo = { appear: false, disappear: false };

  const dispatch = createDispatch($host(), {
    onAppear,
    onFirstAppear,
    onDisappear,
    onFirstDisappear,
  });

  onMount(() => {
    observe($host(), {
      appear(event) {
        dispatch('appear', event);
        if (!triggerInfo.appear) {
          triggerInfo.appear = true;
          dispatch('firstappear', event);
        }
      },
      disappear(event) {
        if (!triggerInfo.appear)
          return;
        dispatch('disappear', event);
        if (!triggerInfo.disappear) {
          triggerInfo.disappear = true;
          dispatch('firstdisappear', event);
        }
      },
    });

    return () => unObserve($host());
  });
</script>

<section {...rest}>
  <slot />
</section>

<style>
  :host {
    display: block;
  }
</style>
