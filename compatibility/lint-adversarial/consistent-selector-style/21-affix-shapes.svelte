<script>
	const base = 'pre-';
	const tail = '-post';
	let n = 1;
	const cyclic = cyclic;
</script>

<div class="{base}mid">a</div>
<div class={`${base}x${tail}`}>b</div>
<div class={base + n + tail}>c</div>
<div id={`id-${n}`}>d</div>
<div id="{cyclic}">e</div>

<style>
	.pre-mid {
		color: red;
	}
	.pre-x-post {
		color: red;
	}
	#id-1 {
		color: red;
	}
</style>
