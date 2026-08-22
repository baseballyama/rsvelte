<script>
	let value = $state('v');
	const props = { id: 'p', 'data-x': 1 };
	let checked = $state(true);
</script>

<input value={value} />
<input {value} />
<input value="{value}" />
<input value="a{value}b" />
<input value='{value}' />
<input value=unquoted />
<input value />
<input {...props} value={value} />
<input value={value} {...props} />
<input type="checkbox" bind:checked {...props} />
<div aria-label="x" data-camelCase="y" DATA-UPPER="z" data-="empty-name-tail"></div>
<div style="--a: 1; --b:{value}"></div>
<img src="a.png" alt="" />
<input readonly={false} disabled={undefined} hidden={null} />
<button aria-pressed={checked}>{value}</button>
