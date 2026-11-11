<!-- The local is WRITTEN, which is what upstream's `!binding.updated` guard reads: a
     record reused by name resolves to the outer `$derived` and reports its update. -->
<script>
	let base = $state(1);
	let v = $derived(base);
</script>
<button onclick={() => { var v = 0; v--; base = (typeof v).length; }}></button>
{v}
