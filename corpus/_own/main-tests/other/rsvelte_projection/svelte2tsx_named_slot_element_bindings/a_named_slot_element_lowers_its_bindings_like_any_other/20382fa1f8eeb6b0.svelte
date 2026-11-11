<script lang="ts">import C from './C.svelte';import { a } from './a';let element: HTMLButtonElement;</script>
<C><button slot="t" use:a bind:this={element}>x</button></C>