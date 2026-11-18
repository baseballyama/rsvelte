export function s() {
	let raw = $state.raw({ a: 1 });
	let eager = $state.eager(0);
	function f() {
		raw = { a: 2 };
		eager = eager + 1;
	}
	return f;
}
