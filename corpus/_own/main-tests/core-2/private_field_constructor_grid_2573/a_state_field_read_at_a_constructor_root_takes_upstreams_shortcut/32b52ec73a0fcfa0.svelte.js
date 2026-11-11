export class R {
	#n = $state(0);
	#r = $state.raw({});
	#d = $derived(this.#n * 2);

	constructor(o) {
		const inst = this;
		log(this.#n);
		log(inst.#n);
		log(o.#r);
		log(o.#d);
	}
}
