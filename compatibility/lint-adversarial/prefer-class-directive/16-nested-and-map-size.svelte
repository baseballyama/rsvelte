<script>
	let c = true;
	let d = false;
</script>

<div class="{c ? 'a' : d ? 'b' : ''}">1</div>
<div class="{c ? (d ? 'a' : 'a') : ''}">2</div>
<div class="{c ? '' : ''}">3</div>
<div class="{c ? 'a' : 'b'}">4</div>
<div class="{!c ? 'a' : ''}">5</div>
<div class="{c === d ? 'a' : ''}">6</div>
<div class="{typeof c === 'boolean' ? 'a' : ''}">7</div>
