<script>import Child from './C.svelte';</script>
<Child let:value>{#if true}{#snippet children()}{value}{/snippet}{/if}</Child>