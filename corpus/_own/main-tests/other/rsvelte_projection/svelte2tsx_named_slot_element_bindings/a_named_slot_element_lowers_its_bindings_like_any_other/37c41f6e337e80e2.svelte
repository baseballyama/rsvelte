<script lang="ts">import C from './C.svelte';let g: string[] = [];</script>
<C><input slot="t" type="checkbox" bind:group={g} /></C>