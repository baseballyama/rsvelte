<script>
	let ok = true;
</script>

<div class={ok ? 'a' + '' : ''}>1</div>
<div class={ok ? `a${'b'}` : ''}>2</div>
<div class={ok ? `${'c'}` : ''}>3</div>
