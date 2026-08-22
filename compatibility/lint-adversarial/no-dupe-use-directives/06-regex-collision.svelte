<script>
	let act = (n, o) => {};
	let s = 'a//b';
	let f = (x) => x;
	let g = (x) => x;
</script>

<div use:act={s.split(/\/\//).map(f)} use:act={s.split(/\/\//).map(g)}>1</div>
