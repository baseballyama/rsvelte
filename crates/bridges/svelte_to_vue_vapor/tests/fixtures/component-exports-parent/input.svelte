<script>
  import Child from '../component-exports-child/input.svelte';
  let child = $state();
  let enabled = $state(true);
  let observed = $state(0);
  let counter = $state.raw();
  class ReplacementCounter {
    value = 10;
    increment() { this.value += 10; }
  }
</script>
<button id="increase" onclick={() => { child?.increase(); observed = child?.current() ?? -1; }}>increase</button>
<button id="toggle" onclick={() => enabled = !enabled}>toggle</button>
<button id="construct" onclick={() => counter = new child.Counter()}>construct</button>
<button id="counter-increase" onclick={() => { counter.increment(); counter = counter; }}>counter increase</button>
<button id="replace" onclick={() => { child.Counter = ReplacementCounter; child.increase = () => observed = 99; }}>replace</button>
{#if enabled}<Child initial={2} bind:this={child} />{/if}
<p>{child?.version ?? 'none'}:{child?.token ?? 'none'}:{child?.object.count ?? 0}:{observed}</p>
<p>{counter?.value ?? 0}</p>
