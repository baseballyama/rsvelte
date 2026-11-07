<script lang="ts">
	const str = 'abc' as const
</script>

{#await 1234 then number}
	<p>The number is {number}</p>
{/await}

{#await str then s}
	<p>The string is {s}</p>
{/await}

{#await str.slice(0) then s}
	<p>The string is {s}</p>
{/await}
