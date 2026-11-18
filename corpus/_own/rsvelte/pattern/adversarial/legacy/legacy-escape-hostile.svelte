<script>
	let s = '\\';
	let t = "a\"b";
	let u = '\'';
	let v = `x${'\\'}y`;
	let re = /a\/b[/]c/g;

	$: joined = s + t + u + v + re.source;
	$: hasBrace = joined.includes('}') ? ')' : '{';
	$: nested = `${`${joined};`}`;
	$: fn = (x = '\;') => x + '};';
</script>

<p>{joined}{hasBrace}{nested}{fn()}</p>
