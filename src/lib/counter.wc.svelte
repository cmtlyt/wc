<svelte:options customElement='my-counter' />

<script lang='ts'>
  import Span from '../components/span.svelte';

  const { 'init-value': initValue = 0 } = $props();

  let count: number = $state(Number(initValue));

  const increment = () => {
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
