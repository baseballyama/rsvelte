let base = $state(1);

export function named() {
	$inspect.trace();
	return base;
}

export async function awaited() {
	$inspect.trace();
	return base;
}

export const arrow = () => {
	$inspect.trace();
	return base;
};

export const inner = function withOwnName() {
	$inspect.trace();
	return base;
};

export const labelled = () => {
	$inspect.trace('lbl');
	return base;
};

export class C {
	m() {
		$inspect.trace();
		return base;
	}
}

export function outer() {
	function nested() {
		$inspect.trace();
		return base;
	}

	return nested();
}
