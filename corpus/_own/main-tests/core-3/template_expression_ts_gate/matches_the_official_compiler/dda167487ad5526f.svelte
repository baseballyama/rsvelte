<script>let y = "s"; let f = (v) => v;</script>
{#await Promise.resolve(y as string)}<p>x</p>{:then v}<p>{v}</p>{/await}
