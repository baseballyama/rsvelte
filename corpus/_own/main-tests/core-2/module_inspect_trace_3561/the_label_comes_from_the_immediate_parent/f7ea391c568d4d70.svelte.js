let base = $state(1);
export function outer() {
	function inner() {
		$inspect.trace();
		return base;
	}
	return inner();
}
