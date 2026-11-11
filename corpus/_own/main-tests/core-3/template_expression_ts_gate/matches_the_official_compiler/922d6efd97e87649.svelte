<script module lang="ts">export const zz: number = 1;</script>
<script>let y = "s"; let act = () => {}; let flip = () => {};</script>
{#if true}{@const { a = <string>y } = {}}<p>{a}</p>{/if}
