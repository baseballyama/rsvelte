<script>let v = "OUTER";</script>
{#each [{ v: "A" }] as { v }}
	<button onclick={() => { v = "W"; }}>b</button>
{/each}