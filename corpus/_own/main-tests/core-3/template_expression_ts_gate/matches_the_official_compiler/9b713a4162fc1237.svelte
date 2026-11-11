<script lang="ts">let y: any = "s"; let f = (v: any) => v;</script>
{#snippet s(a = <string>y)}<p>{a}</p>{/snippet}{@render s()}
