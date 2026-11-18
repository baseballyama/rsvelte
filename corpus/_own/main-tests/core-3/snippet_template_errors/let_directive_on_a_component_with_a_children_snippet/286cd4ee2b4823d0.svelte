<script>import Child from './C.svelte';</script>
<Child let:value={v}>{#snippet children()}{v}{/snippet}</Child>