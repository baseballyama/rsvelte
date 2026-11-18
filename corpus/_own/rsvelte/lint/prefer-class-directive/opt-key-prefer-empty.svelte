<script>
	/* eslint svelte/prefer-class-directive: ["warn",{"prefer":"empty"}] */
</script>

<div class="{cond ? 'a' : ''}">1</div>
<div class="x {cond ? 'a' : ''}">2</div>
<div class="{cond ? 'a' : 'b'}">3</div>
<div class="x {cond ? 'a' : 'b'} y">4</div>
