<script lang="ts" generics="T extends Record<string, unknown>, U extends keyof T = keyof T">
	interface Props {
		rows: T[];
		key: U;
		render?: (row: T, index: number) => string;
	}

	let { rows, key, render = (row: T) => String(row[key]) }: Props = $props();

	type Pair<A, B = A> = [A, B];
	const pairs: Pair<string, number>[] = rows.map((row, i) => [render(row, i), i]);

	function pick<K extends U>(row: T, k: K): T[K] {
		return row[k];
	}

	const first = rows[0] ? pick(rows[0], key) : undefined;
</script>

<ul>
	{#each pairs as [label, index] (index)}
		<li>{label} #{index}</li>
	{/each}
</ul>
<p>{String(first)}</p>
