let base = $state(1);
export const go = function inner() {
	$inspect.trace();
	return base;
};
