<script module lang="ts">export const zz: number = 1;</script>
<script>let y = "s"; let f = (v) => v;</script>
{#snippet s(a)}<p>{a}</p>{/snippet}{@render s(y as string)}
