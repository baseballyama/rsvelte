<script lang="ts">
	type O = { a: number };
	let a = 1;
</script>

{{ a } as O}
{[a] satisfies number[]}
{<O>{ a }}
{{ a } as const}
