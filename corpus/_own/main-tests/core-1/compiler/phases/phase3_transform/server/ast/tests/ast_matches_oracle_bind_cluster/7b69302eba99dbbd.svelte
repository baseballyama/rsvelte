<script>
	let div = $state();
	export const someData = '123';
</script>

<div bind:this={() => div, v => div = v}>123</div>
