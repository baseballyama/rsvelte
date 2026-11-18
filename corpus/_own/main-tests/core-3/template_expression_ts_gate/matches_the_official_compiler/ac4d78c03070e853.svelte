<script module lang="ts">export const zz: number = 1;</script>
<script>let y = "s"; let f = (v) => v;</script>
{#await Promise.resolve(y)}<p>x</p>{:then v}<p>{v}</p>{/await}
