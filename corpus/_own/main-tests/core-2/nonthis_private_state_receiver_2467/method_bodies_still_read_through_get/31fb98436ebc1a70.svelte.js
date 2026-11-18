export class R {
	#n = $state(0);

	m(s) {
		const inst = this;
		inst.#n += 1;
		inst.#n ??= s;
		inst.#n = { a: s };
		const a = inst.#n;
	}
}
