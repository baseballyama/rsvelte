<script lang="ts">let y: any = "s"; let act = (): any => {}; let flip = (): any => {};</script>
{#await Promise.reject({})}<p>x</p>{:catch { a = <string>y }}<p>{a}</p>{/await}
