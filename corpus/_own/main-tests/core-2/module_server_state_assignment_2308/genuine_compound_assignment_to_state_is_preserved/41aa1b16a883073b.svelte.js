export function t() {
	let runs = $state(0);
	function f() {
		runs += 1;
		runs *= 2;
	}
	return f;
}
