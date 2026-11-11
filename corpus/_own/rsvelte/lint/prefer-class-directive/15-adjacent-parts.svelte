<script>
	let c = true;
</script>

<div class="{c ? 'a' : ''}{c ? 'b' : ''}">x</div>
<div class="{c ? 'a' : ''} {c ? '' : 'b'}">y</div>
<div class="pre{c ? 'a' : ''}">z</div>
<div class="{c ? 'a' : ''}post">w</div>
<div class="{c ? '' : ''}{c ? 'a' : ''}">v</div>
<div class="{c ? 'a' : ''}{'lit'}">u</div>
<div class={c ? 'a' : ''}>t</div>
