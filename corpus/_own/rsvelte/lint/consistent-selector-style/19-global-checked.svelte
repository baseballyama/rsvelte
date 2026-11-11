<script>
	/* eslint svelte/consistent-selector-style: ["warn", { checkGlobal: true }] */
</script>

<div class="ha hb">x</div>
<div id="hid">y</div>

<style>
	:global(.ha.hb) {
		color: red;
	}
	:global(#hid) {
		color: red;
	}
	:global {
		.ha {
			color: blue;
		}
	}
</style>
