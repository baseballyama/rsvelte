<script>
	let n = $state(1);
</script>

<style>
	[class~='a'] {
		color: red;
	}
	[class~='q'] {
		color: blue;
	}
	#i {
		color: teal;
	}
	[data-v='1'] {
		color: olive;
	}
</style>

<svelte:element this={'div'} class="a" id="i" data-v="1">t</svelte:element>
<div class:zz={n}>t</div>
