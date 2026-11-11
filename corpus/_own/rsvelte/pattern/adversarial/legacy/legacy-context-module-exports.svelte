<svelte:options runes={false} />

<script context="module">
  let created = 0;

  export function total() {
    return created;
  }

  export const label = "legacy";
</script>

<script>
  export let value = 1;

  created += 1;

  $: doubled = value * 2;
</script>

<b>{label}{value}{doubled}{total()}</b>
