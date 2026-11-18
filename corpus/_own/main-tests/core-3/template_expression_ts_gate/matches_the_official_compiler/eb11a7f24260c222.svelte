<script module lang="ts">export const zz: number = 1;</script>
<script>let y = "s"; let act = () => {}; let flip = () => {};</script>
{#await Promise.reject({})}<p>x</p>{:catch { a = <string>y }}<p>{a}</p>{/await}
