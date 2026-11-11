export class R {
	#x = $state.raw({});
	#n = $state(0);

	constructor(s) {
		const inst = this;
		inst.#n += 1;
		const a = inst.#n;
		const b = inst.#x.foo;
		const c = inst.#n?.bar;
		log(inst.#n);
	}
}
