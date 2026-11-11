<script>
	export let id;
	export let items;

	$: found = items.find(({ id }) => id);
	$: pairs = items.map(([id, n]) => id + n);
	$: nested = items.map(({ a: { id } }) => id);
	$: rested = items.map(({ ...id }) => id);
	$: named = items.map(function pick({ id }) {
		return id;
	});

	$: shifted = items.map((n) => n + id);
</script>

<p>{found}{pairs}{nested}{rested}{named}{shifted}</p>
