<script>import Child from './C.svelte';</script>
<Child slot="" let:value>{#snippet children()}{value}{/snippet}</Child>