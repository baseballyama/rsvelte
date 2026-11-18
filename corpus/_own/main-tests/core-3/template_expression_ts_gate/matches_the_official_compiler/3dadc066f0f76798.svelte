<script>let y = "s"; let f = (v) => v;</script>
{#snippet s(a = y as string)}<p>{a}</p>{/snippet}{@render s()}
