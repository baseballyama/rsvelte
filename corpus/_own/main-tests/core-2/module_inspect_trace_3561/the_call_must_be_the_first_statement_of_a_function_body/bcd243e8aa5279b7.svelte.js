let base = $state(1);
export function go() {
	const q = 1;
	$inspect.trace();
	return base + q;
}
