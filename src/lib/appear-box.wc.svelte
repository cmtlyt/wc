<svelte:options customElement='appear-box' />

<script module lang='ts'>
  import type { ListenerFunc } from '../utils/intersection-observer';
  import { onMount } from 'svelte';
  import { createDispatch } from '../utils/create-dispatch';
  import { observe } from '../utils/intersection-observer';
</script>

<script lang='ts'>
  const props: {
    root: HTMLElement;
    onAppear?: ListenerFunc;
    onFirstAppear?: ListenerFunc;
    onDisappear?: ListenerFunc;
    onFirstDisappear?: ListenerFunc;
  } = $props();

  const { root = $host(), onAppear, onFirstAppear, onDisappear, onFirstDisappear } = props;

  const triggerInfo = { appear: false, disappear: false };

  const dispatch = createDispatch(root, {
    onAppear,
    onFirstAppear,
    onDisappear,
    onFirstDisappear,
  });

  onMount(() => {
    const unObserve = observe(root, {
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

    return () => unObserve();
  });
</script>

<slot />
