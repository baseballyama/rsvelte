<script lang="ts">import C from './C.svelte'; export let a: any; export let b: any; const o = {a:1};</script>
<C><svelte:fragment slot="s"><slot a /></svelte:fragment></C>