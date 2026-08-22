<script>
	import { SvelteMap, SvelteSet, SvelteDate, SvelteURL } from 'svelte/reactivity';

	const scores = new SvelteMap([['a', 1]]);
	const tags = new SvelteSet(['x']);
	const when = new SvelteDate();
	const url = new SvelteURL('https://example.com/p?q=1');

	function touch() {
		scores.set('b', scores.size);
		tags.add(`t${tags.size}`);
		when.setFullYear(2030);
		url.searchParams.set('q', String(scores.size));
	}
</script>

<button onclick={touch}>{scores.size}:{tags.size}:{when.getFullYear()}:{url.search}</button>

{#each scores as [name, score] (name)}
	<span>{name}={score}</span>
{/each}

{#each tags as tag}
	<em>{tag}</em>
{/each}
