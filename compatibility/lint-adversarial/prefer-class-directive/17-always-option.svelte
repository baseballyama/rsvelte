<script>
	/* eslint svelte/prefer-class-directive: ["warn", { prefer: "always" }] */
	let c = true;
	let d = false;
</script>

<div class="{c ? 'a' : 'b'}">1</div>
<div class="x {c ? 'a' : 'b'} y">2</div>
<div class="{c ? 'a' : d ? 'b' : 'c'}">3</div>
<div class="{c ? 'a b' : 'c'}">4</div>
