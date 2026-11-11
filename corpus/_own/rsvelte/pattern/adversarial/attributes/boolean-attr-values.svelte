<script>
	let maybe = $state(null);
	let num = $state(0);
</script>

<input disabled={0} readonly={''} required={maybe} />
<div hidden={maybe} inert={num}></div>
<details open={undefined}>
	<summary>u</summary>
</details>
<button disabled>always</button>
<input type="checkbox" checked={NaN} />
<progress value={num} max={100}></progress>
<meter value={0.5} low={0.2} high={0.8} optimum={0.9}></meter>
