<script>
	/* eslint svelte/html-self-closing: ["warn",{"math":"always"}] */
</script>

<img src="a.png" alt="a">
<img src="b.png" alt="b" />
<div></div>
<div />
<svg><circle cx="1" cy="1" r="1"></circle></svg>
<svg><circle cx="1" cy="1" r="1" /></svg>
<Comp></Comp>
<Comp />
<svelte:element this={"div"}></svelte:element>
<svelte:element this={"div"} />
