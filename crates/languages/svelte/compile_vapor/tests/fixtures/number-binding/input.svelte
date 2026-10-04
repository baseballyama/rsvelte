<script>let value = $state(1); let range = $state();</script>
<input type="number" bind:value={value} />
<input type="range" bind:value={range} />
<p>{String(value)}:{typeof value};{range}</p>
