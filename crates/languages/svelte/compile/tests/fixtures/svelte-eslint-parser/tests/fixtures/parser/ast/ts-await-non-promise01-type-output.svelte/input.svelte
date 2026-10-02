<script lang="ts">
	const str = 'abc' as const // str: "abc", const: /*unresolved*/ any
</script>

{#await 1234 then number} <!-- number: 1234 -->
	<p>The number is {number}</p> <!-- number: 1234 -->
{/await}

{#await str then s} <!-- str: "abc", s: "abc" -->
	<p>The string is {s}</p> <!-- s: "abc" -->
{/await}

{#await str.slice(0) then s} <!-- str.slice(0): string, s: string -->
	<p>The string is {s}</p> <!-- s: string -->
{/await}
