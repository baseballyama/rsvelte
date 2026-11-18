<script>
	export let item;
	export let width = 1;

	$: product =
		item.a *
		item.b;

	$: smaller =
		item.a <
		item.b;

	$: shifted =
		item.a <<
		item.b;

	$: present =
		'a' in
		item;

	$: isDate =
		item instanceof
		Date;

	$: last =
		item.a,
		item.b;

	function toggle() {
		width = 2;
	}
</script>

<button on:click={toggle}>{product}{smaller}{shifted}{present}{isDate}{last}{width}</button>
