<script>
	import { writable, readable, derived, get } from 'svelte/store';

	const count = writable(0);
	const time = readable(0, () => () => {});
	const doubled = derived(count, ($c) => $c * 2);
	const both = derived([count, doubled], ([$c, $d]) => $c + $d);

	let swap = writable('a');

	function custom(value) {
		return {
			subscribe(run) {
				run(value);
				return () => {};
			}
		};
	}

	const inline = custom({ nested: { deep: 'x' } });

	$: sum = $count + $doubled + $both;
	$: if ($count > 3) count.set(0);

	const snapshot = () => get(count);
</script>

<button onclick={() => count.update((c) => c + 1)}>{$count}</button>
<p>{$doubled} {$both} {$time} {sum}</p>
<p>{$inline.nested.deep} {$swap}</p>
<p>{$count + ($doubled || 0)} {snapshot()}</p>
{#each [$count, $doubled] as v}
	<span>{v}</span>
{/each}
