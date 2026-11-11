export function s() {
	let a = $state({ x: 1 });
	function snap() { return $state.snapshot(a); }
	return snap;
}
