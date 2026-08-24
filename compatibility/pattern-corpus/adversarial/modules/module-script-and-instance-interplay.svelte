<script module>
  let shared = $state(0);

  export function bumpShared() {
    shared += 1;
    return shared;
  }

  export const constant = 1;

  const moduleLocal = { count: 0 };
</script>

<script>
  let { seed = 0 } = $props();

  let local = $state(seed);

  const combined = $derived(local + shared + constant);

  function bump() {
    local += 1;
    moduleLocal.count += 1;
    bumpShared();
  }
</script>

<b>{combined}{shared}{moduleLocal.count}</b>
<button onclick={bump}>go</button>
