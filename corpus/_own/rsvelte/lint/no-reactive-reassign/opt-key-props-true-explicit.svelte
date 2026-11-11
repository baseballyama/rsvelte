<script>
	/* eslint svelte/no-reactive-reassign: ["warn",{"props":true}] */
	export let base = 1;
	$: doubled = base * 2;
	function bump() {
		doubled = 3;
		base = 4;
	}
	void bump;
</script>

<div>{doubled}</div>
