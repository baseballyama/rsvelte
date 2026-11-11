<script>let x = 1; let f = () => 1; let o = { k: 1 }; let items = [{}];</script>
{#each items as { a = 0x10 }}<span>{a}</span>{/each}