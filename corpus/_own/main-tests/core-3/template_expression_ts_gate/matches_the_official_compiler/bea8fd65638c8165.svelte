<script>let y = "s"; let f = (v) => v;</script>
{#await Promise.resolve(<string>y)}<p>x</p>{:then v}<p>{v}</p>{/await}
