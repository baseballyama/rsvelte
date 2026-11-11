<script lang="ts">import C from './C.svelte';let element: HTMLElement;</script>
<C><svelte:element this={'div'} slot="t" bind:this={element} /></C>