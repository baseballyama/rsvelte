<script lang="ts">import C from './C.svelte';let a: any = 1;</script>
<C><button slot="s" class="x {// why
a} z">c</button></C>