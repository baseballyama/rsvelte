<script>
	/* eslint svelte/no-inline-styles: ["warn",{"allowTransitions":true}] */
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	void fade; void flip;
</script>

<div style="color: red" transition:fade>a</div>
<div style="color: red">b</div>
<div style="color: red" animate:flip>c</div>
