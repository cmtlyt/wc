<svelte:options customElement='my-counter' />

<script lang='ts'>
  import Span from '../components/span.svelte';
  import { pt } from '../utils/props-transform';

  const props = $props();
  const { initValue = 0, disable = false } = pt(props, ['initValue|number', 'disable|boolean']);

  let count: number = $state(initValue);

  const increment = () => {
    if (disable)
      return;
    count += 1;
  };
</script>

<section>
  <Span>{count}</Span>
  <button onclick={increment}>
    count is {count}
  </button>
</section>

<style>
  button{
    background: pink;
  }
</style>
