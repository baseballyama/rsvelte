<script>
	let b = 'x';
	let w = 10;
</script>

<div class='a {b} c'>sequence single-quoted flagged</div>
<div class="a {b} c">ok</div>
<div style:width='{w}px'>style directive sequence flagged</div>
<div style:width="{w}px">ok</div>
<div data-m={`t ${b}`}>template literal expression unquoted ok</div>
