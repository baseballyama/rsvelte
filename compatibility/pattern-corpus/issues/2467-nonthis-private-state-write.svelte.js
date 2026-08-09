export class R {
	#n = $state(0);
	copy = 0;

	constructor(s) {
		const inst = this;
		inst.#n ??= s;
		inst.#n = { a: s };
		this.copy = inst.#n;
	}
}
