export class R {
	#x = $state.raw({});
	#n = $state(0);
	#d = $derived(this.#n * 2);

	constructor(s) {
		const inst = this;
		inst.#n ??= s;
		inst.#n &&= s;
		inst.#n ||= s;
		inst.#x ??= s;
		inst.#d ??= s;
		inst.#n <<= 2;
	}
}
