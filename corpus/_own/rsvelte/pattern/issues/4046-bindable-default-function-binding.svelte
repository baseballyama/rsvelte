<script>
	let fn_initial = () => {};
	let obj_initial = { a: 1 };
	let undefined_initial = undefined;

	let {
		from_fn = $bindable(fn_initial),
		from_obj = $bindable(obj_initial),
		from_undefined = $bindable(undefined_initial),
	} = $props();
</script>

<p>{from_fn}{from_obj}{from_undefined}</p>
