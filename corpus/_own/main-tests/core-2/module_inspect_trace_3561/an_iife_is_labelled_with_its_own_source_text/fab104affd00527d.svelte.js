let base = $state(1);
export const v = (function () {
	$inspect.trace();
	return base;
})();
