<script>
	let x = 1;
	let rest = {};
</script>

{ x }
{x}
<div data-a={ x } {...rest}>a</div>
<div {   ...rest }>spread with inner spaces</div>
{#if x }
	a
{ /if}
