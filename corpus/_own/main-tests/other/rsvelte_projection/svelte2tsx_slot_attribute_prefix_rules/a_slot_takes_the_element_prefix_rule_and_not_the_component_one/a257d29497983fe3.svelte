<script lang="ts">import C from './C.svelte'; export let b: any;</script>
<C><div slot="s" --x={b} /></C>