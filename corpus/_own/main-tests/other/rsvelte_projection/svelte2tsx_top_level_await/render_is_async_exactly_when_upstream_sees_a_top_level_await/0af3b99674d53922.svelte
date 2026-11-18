<script lang="ts">
let { a }: { a: string } = $props();
const resume = $derived((await fetch(a)) as Response);
</script>
<p>x</p>
