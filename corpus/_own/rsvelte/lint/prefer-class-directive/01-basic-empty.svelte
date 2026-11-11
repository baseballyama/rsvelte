<script>
	let ok = true;
</script>

<div class={ok ? 'a' : ''}>1</div>
<div class={ok ? '' : 'b'}>2</div>
<div class={ok ? 'a' : 'b'}>3</div>
<div class="x {ok ? 'a' : ''}">4</div>
