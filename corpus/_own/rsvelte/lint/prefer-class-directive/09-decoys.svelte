<script>
	let ok = true;
	let cls = 'k';
</script>

<div title={ok ? 'a' : ''}>1</div>
<div class="a ? 'b' : ''">2</div>
<div class={ok ? cls : ''}>3</div>
<div class={ok ? 'a' : cls}>4</div>
