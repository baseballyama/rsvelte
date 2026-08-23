<script>
	let v = $state(1);
	let el;
</script>

<var>{v}</var>
<var bind:this={el}>x</var>

<svg>
	<switch>
		<text>{v}</text>
	</switch>
</svg>

<async>{v}</async>
<my-tag>{v}</my-tag>
