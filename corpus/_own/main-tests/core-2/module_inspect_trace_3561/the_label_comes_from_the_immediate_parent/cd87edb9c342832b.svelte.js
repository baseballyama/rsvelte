let base = $state(1);
export class C {
	get v() {
		$inspect.trace();
		return base;
	}
}
