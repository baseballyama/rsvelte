<!-- The same graft with `let`, which does not hoist: shadowing an outer name is what
     the mis-fix keys on, not the declaration keyword. -->
<script>
	let base = $state(1);
	let v = $derived(base);
</script>
<button onclick={() => { let v = 0; base = (typeof v).length; }}></button>
{v}
