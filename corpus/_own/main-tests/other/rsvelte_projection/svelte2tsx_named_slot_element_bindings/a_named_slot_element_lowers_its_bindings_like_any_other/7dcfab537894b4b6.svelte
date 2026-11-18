<script lang="ts">import C from './C.svelte';let v = 1;</script>
<C><div slot="t" bind:clientWidth={v}></div></C>