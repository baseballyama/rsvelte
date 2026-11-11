export class R {
	#x = $state.raw({});
	#n = $state(0);

	constructor(s) {
		const inst = this;
		inst.#n = { a: s };
		inst.#x = { a: s };
		inst.#n = 5;
	}
}
