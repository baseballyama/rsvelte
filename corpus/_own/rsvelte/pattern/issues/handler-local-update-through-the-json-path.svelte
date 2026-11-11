<script>
	let base = $state(1);
	let v = $derived(base);
	let n = $state(0);
</script>

<!--
  `convert_update_expression` is the JSON port of the update lowering. Its typed
  twin and `try_transform_update` both refuse a name whose reference belongs to a
  plain local; this one asked nothing, so a `var` shadowing a component signal was
  updated through the signal (`$.update(v)` for `v++`).
-->
<button
	onclick={() => {
		var v = 0;
		while (v < 1) {
			v++;
		}
		{
			var w = 0;
			w--;
		}
		base = (typeof v).length + w;
		n++;
	}}
></button>
{v}{n}
