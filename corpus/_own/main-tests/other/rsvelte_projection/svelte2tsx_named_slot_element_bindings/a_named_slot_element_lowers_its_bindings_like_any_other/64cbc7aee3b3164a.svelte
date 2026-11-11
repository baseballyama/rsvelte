<script lang="ts">import C from './C.svelte';let element: HTMLButtonElement;</script>
<C><svelte:fragment slot="trigger"><button bind:this={element}>x</button></svelte:fragment></C>