<script>
	let el;
	function boom() {}
</script>

<div bind:this={el}>a</div>

<!-- the inner-block `let el` shadows only its own block -->
<button
	onclick={() => {
		el.remove();
		{
			let el = document.createElement('i');
			el.remove();
		}
	}}>a</button
>

<!-- the catch param shadows `el` inside the catch block -->
<button
	onclick={() => {
		try {
			boom();
		} catch (el) {
			el.remove();
		}
	}}>b</button
>
