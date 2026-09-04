<!-- Guards a name-keyed reuse of a template-local's binding record: keyed on the name
     rather than the declaration's position, this initializer is grafted onto the outer
     `v` and the server folds `{v}` to a constant. Green on main; red on that mis-fix. -->
<script>
	let base = $state(1);
	let v = $derived(base);
</script>
<button onclick={() => { var v = 0; base = (typeof v).length; }}></button>
{v}
