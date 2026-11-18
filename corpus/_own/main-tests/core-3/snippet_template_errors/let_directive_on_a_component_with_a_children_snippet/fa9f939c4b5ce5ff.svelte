<script>import Child from './C.svelte';</script>
<Child let:value={{ a }}>{#snippet children()}{a}{/snippet}</Child>