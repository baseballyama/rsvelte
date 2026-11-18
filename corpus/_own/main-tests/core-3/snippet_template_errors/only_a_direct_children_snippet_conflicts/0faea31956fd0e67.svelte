<script>import Child from './C.svelte';</script>
<Child let:value>{value}{#snippet foo()}x{/snippet}</Child>