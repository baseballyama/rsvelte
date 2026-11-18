<script>import { format } from "./format.js"; let { items, header } = $props(); let count = $state(0);</script>
{#snippet row(label, onclick)}<button {onclick}>{label}</button>{/snippet}
<div>{@render row(format(items), () => count++)}</div>
{@render header?.(format(count), count)}
{@render row(`${count}`, format)}
