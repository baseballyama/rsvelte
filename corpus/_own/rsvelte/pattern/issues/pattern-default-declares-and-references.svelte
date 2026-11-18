<script>
	const source = {};
	// The default value of a destructured binding is an ordinary expression: the
	// arrow it holds declares `input`, so a generated handler must deconflict to
	// `input_1`. Only the pattern's `left` was walked, so nothing here reached
	// `root.conflicts` and the handler came out as `function input()`.
	let { search = async (input) => input.toLowerCase() } = source;
	let [first = (option) => option] = [];
	let { deep = { pick: (record) => record } } = source;
</script>

<div
	oninput={() => {
		search('A');
	}}
	onoption={() => {
		first(1);
	}}
	onrecord={() => {
		deep.pick(1);
	}}
></div>
