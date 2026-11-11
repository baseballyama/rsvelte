let base = $state(1);
export class C {
	m() {
		$inspect.trace();
		return base;
	}
}
