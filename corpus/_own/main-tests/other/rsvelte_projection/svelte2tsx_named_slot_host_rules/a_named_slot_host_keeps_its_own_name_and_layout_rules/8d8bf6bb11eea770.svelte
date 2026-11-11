<script lang="ts">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>
<C><svelte:self slot="s" data-x={b} /></C>