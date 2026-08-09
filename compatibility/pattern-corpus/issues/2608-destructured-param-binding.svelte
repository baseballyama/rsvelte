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

	$: defaulted = items.map(({ n = id }) => n);
	$: keyed = items.map(({ [id]: n }) => n);
	$: outer = items.map((o = { id }) => o);
</script>

<p>{found}{pairs}{nested}{rested}{named}{defaulted}{keyed}{outer}</p>
