let base = $state(1);
function go() {
	$inspect.trace();
	return base;
}
export { go };
