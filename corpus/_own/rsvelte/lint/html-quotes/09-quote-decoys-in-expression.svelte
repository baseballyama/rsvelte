<script>
	let x = 1;
</script>

<div data-a={x === 1 ? "yes" : 'no'}>quotes inside expression, unquoted mustache ok</div>
<div data-b="{"inner" + x}">double quotes inside a double-quoted mustache</div>
<div title="a=b {'}'} c">closing brace hidden in a string part</div>
