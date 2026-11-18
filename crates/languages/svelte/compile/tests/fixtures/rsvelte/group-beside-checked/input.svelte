<script>let g = $state(); let t = $state('a'); let { p } = $props();</script>
<input type="radio" value={t} checked={t === g} bind:group={g} />
<input type="checkbox" value={t} checked={t === g} bind:group={g} {...p} />
<input type="checkbox" checked={true} bind:group={g} />
