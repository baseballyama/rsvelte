<script lang="ts">import C from './C.svelte'; import D from './D.svelte'; export let b: any;</script>
<C><svelte:component this={D} slot="s" --x="1" /></C>