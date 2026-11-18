<script>
	let obj = { k: 1 };
	let s = '}';
</script>

{{ k: 2 }.k}
{obj.k}
{`t${ obj.k }u`}
{s === '}' ? 'y' : 'n'}
