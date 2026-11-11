<script>let y = "s"; let act = () => {}; let flip = () => {};</script>
{#await Promise.resolve({})}<p>x</p>{:then { a = <string>y }}<p>{a}</p>{/await}
