<script module>
  let shared = $state(0);
  let doubled = $derived(shared * 2);
  export const description = 'module';
  export function increment() { shared++; }
  class Counter {
    value = $state(0);
    increment() { this.value++; }
  }
  const counter = new Counter();
</script>
<script>
  let { label = description } = $props();
  let local = $state(0);
  function change() { increment(); counter.increment(); local++; }
</script>
<button onclick={change}>{label}:{shared}:{doubled}:{counter.value}:{local}</button>
