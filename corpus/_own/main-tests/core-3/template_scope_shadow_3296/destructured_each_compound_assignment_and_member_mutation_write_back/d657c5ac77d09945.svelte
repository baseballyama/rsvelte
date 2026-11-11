<script>let value = 0;</script>
{#each [{ value: 1, nested: { count: 1 } }] as { value, nested }}
	<button onclick={() => { value += 2; nested.count += 1; }}>b</button>
{/each}