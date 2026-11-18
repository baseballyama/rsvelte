<script>
	let out = $state('');
	const openTag = '<script>';
	const tpl = '<script src="/x.js"><\/script>';

	export function render() {
		out = openTag + tpl;
		return out;
	}
</script>

<pre>{out}</pre>
