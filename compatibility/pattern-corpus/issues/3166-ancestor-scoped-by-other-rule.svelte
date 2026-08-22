<script>
	let cls = $state('a');
</script>

<style>
	.b > .a {
		color: red;
	}
	.c > .a {
		color: navy;
	}
	.keep {
		color: green;
	}
</style>

<div class="b"><section><div class={cls}>t</div></section></div>
<div class="c"><div class={cls}>t</div></div>
