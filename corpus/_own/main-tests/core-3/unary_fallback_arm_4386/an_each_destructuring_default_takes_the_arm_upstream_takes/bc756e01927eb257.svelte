<script>let x = 1; let f = () => 1; let o = { k: 1 }; let items = [{}];</script>
{#each items as { a = /a/g }}<span>{a}</span>{/each}