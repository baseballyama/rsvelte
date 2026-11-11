<script lang="ts">let y: any = "s"; let act = (): any => {}; let flip = (): any => {};</script>
{#await Promise.resolve({})}<p>x</p>{:then { a = y as string }}<p>{a}</p>{/await}
