<script lang="ts">
let { a }: { a: string } = $state({});
let { b }: { b: string } = $derived(a);
let [c]: [number] = $derived([1]);
</script>

<button onclick={() => a++}>{b}{c}</button>
