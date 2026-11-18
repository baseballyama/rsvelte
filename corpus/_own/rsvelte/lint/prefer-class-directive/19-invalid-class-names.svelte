<script>
	let c = true;
</script>

<div class="{c ? 'a b' : ''}">1</div>
<div class="{c ? 'a.b' : ''}">2</div>
<div class="{c ? 'héllo' : ''}">3</div>
<div class="{c ? '   ' : 'x'}">4</div>
<div class="{c ? '-' : ''}">5</div>
<div class="{c ? '_' : ''}">6</div>
<div class="{c ? '1' : ''}">7</div>
<div class="{c ? ' a ' : ''}">8</div>
<div class="{c ? 'aA' : ''}">9</div>
