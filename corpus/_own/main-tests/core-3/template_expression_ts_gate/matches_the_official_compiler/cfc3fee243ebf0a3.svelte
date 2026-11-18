<script>let y = "s"; let act = () => {}; let flip = () => {};</script>
{#await Promise.reject({})}<p>x</p>{:catch { a = y }}<p>{a}</p>{/await}
