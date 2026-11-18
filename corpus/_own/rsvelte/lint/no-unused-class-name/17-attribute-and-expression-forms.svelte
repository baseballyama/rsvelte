<script>
	let cond = true;
	let dyn = 'x';
</script>

<div class={['arr-a', cond && 'arr-b']}>a</div>
<div class={cond ? 'tern-a' : 'tern-b'}>b</div>
<div class="lit-a {dyn} lit-b">c</div>
<div class="{dyn} {dyn}">d</div>
<div class:dir-a={cond} class="lit-c">e</div>

<style>
	[class~='arr-a'] {
		color: red;
	}
	.lit-a {
		color: red;
	}
</style>
