<!-- The negative half: no outer binding of this name, so nothing may be grafted. An
     over-correction that folds or wraps every template-local turns this red. -->
<script>
	let base = $state(1);
	let v = $derived(base);
</script>
<button onclick={() => { var zz = 0; base = (typeof zz).length; }}></button>
{v}
