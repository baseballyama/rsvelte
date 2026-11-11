<script>
	let a = $state('x');
	let b = $state('y');
</script>

<p>{a}{b}</p>
<p>{a} {b}</p>
<p>{a}mid{b}</p>
<p>
	{a}
	{b}
</p>
<p>a{a}a{a}a</p>
<span>{a}</span>{b}<span>{a}</span>
<p>({a}){'literal'}[{b}]</p>
<p>{'}'}{'{'}</p>
<p>{`{${a}}`}</p>
