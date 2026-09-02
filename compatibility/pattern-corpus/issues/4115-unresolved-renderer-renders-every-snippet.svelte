<script>
	import Comp from './Comp.svelte';

	let extra = {};
	let alias = row;
</script>

{#snippet row()}<span>x</span>{/snippet}

<div class="aliased">{@render alias()}</div>
<div class="spread"><Comp {...extra} /></div>
<div class="never"></div>

<style>
	.aliased span {
		color: red;
	}

	.spread span {
		color: green;
	}

	.never span {
		color: blue;
	}
</style>
