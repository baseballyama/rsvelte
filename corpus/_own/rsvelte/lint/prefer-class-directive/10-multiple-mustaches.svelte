<script>
	let a = true;
	let b = false;
</script>

<div class="{a ? 'x' : ''} {b ? 'y' : ''}">1</div>
<div class="base {a ? 'x' : ''} tail {b ? 'y' : ''}">2</div>
