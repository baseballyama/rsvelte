<script lang="ts">let y: any = "s"; let f = (v: any) => v;</script>
{#await Promise.resolve(<string>y)}<p>x</p>{:then v}<p>{v}</p>{/await}
