<script>
	let a = 1;
	let c = 'red';
</script>

<div style="width: {a}px; color: {c}; margin: {a}px {a}px">a</div>
<div style="width: calc({a}px + 1px)">b</div>
<div style="content: '{c}'">c</div>
<div style="{c}: red">d</div>
<div style="color{a}: red">e</div>
<div style="color: {c}{c}">f</div>
<div style="--{c}: red">g</div>
