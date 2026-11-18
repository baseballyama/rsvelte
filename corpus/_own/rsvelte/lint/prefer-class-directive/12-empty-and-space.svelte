<script>
	let ok = true;
</script>

<div class={ok ? '' : ''}>1</div>
<div class={ok ? 'a' : ' '}>2</div>
<div class="b {ok ? ' ' : 'a'} c">3</div>
