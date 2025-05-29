<svelte:options customElement={{
  tag: 'lazy-image',
  props: { src: {} },
}} />

<script module>
  import type { SvelteHTMLElements } from 'svelte/elements';
  import type { ListenerFunc } from '../utils/intersection-observer';
  import { pick_ } from '@cmtlyt/base/fp/utils';
  import { untrack } from 'svelte';
  import { createDispatch, Flag, FlagKey } from '../utils/create-dispatch';
  import { pt } from '../utils/props-transform';
  import AppearBox from './appear-box.wc.svelte';
</script>

<script lang='ts'>
  const props: SvelteHTMLElements['img'] & {
    root?: HTMLElement;
    placeholderSrc?: string | null;
    onAppear?: ListenerFunc;
    onFirstAppear?: ListenerFunc;
    onDisappear?: ListenerFunc;
    onFirstDisappear?: ListenerFunc;
  } = $props();

  const { root = $host() } = props;

  const { src, placeholderSrc, rest } = pt(props, ['src', 'placeholderSrc'] as const, ['root']);

  let appeared: boolean = $state(false);
  let placeholder = $state(placeholderSrc());

  const source = $derived(appeared ? untrack(src) : untrack(() => placeholder));

  $effect(() => {
    // 每次 src 更新的时候都使用最新的 src 替换 placeholder
    const curSrc = src();
    untrack(() => placeholder = curSrc);
  });

  const dispatch = createDispatch(root, rest() as Record<string, any>);

  function onAppear(e: any) {
    /// 每次显示的时候, 使用最新的 src
    appeared = true;
    dispatch('appear', { [FlagKey]: Flag.disableDomEmit, detail: e });
  }

  function onDisappear(e: any) {
    /// 每次隐藏的时候, 恢复 placeholder,
    /// 这样在图片不展示在画面中的情况下修改图片不会真实加载图片, 而是等待下一次 appear 的时候才会记载
    appeared = false;
    dispatch('disappear', { [FlagKey]: Flag.disableDomEmit, detail: e });
  }
</script>

{#if src()}
  <AppearBox
    root={root}
    onAppear={onAppear}
    onDisappear={onDisappear}
    {...pick_(['onFirstAppear', 'onFirstDisappear'], rest())}
  >
    {#if source}
      <img {...rest()} src={source} loading='lazy' onload={dispatch('load')} />
    {/if}
  </AppearBox>
{/if}

<style>
  :host {
    display: inline-block;
  }

  img {
    vertical-align: middle;
    width: inherit;
    height: inherit
  }
</style>
