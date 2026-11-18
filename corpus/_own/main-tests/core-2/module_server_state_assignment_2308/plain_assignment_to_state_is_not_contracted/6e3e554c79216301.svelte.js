export function t() {
	let runs = $state(0);
	let plain = 0;
	function f() {
		runs = runs + 1;
		plain = plain + 1;
		runs = runs - 2;
		runs = 1 + runs;
	}
	return f;
}
