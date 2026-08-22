export class Wrapped {
	fromNew = new (class { deep = $state(1); })();
	fromParen = (class { held = $state('h'); });
	plain = $state(0);

	bump() {
		this.plain += 1;
		this.fromNew.deep += 1;
	}
}
