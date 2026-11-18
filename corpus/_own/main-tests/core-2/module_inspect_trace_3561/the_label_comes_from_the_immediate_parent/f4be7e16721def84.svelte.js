let base = $state(1);
export const go = function () {
	$inspect.trace();
	return base;
};
