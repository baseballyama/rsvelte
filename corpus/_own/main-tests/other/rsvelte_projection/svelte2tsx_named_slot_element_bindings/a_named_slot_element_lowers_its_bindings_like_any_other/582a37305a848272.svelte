<script lang="ts">import C from './C.svelte';let element: HTMLButtonElement;</script>
<C><button bind:this={element} slot="trigger">x</button></C>