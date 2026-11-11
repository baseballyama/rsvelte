<script>import Child from './C.svelte';</script>
<Child let:value>{#snippet children()}{value}{/snippet}</Child>