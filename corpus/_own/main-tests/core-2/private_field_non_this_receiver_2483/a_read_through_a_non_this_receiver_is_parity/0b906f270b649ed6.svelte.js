export class R {
	#n = $state(0);

	constructor(o) {
		const inst = this;
		inst.#n++;
		--inst.#n;
		o.#n--;
		console.log(inst.#n);
		(() => {
			inst.#n++;
		})();
	}

	m(o) {
		const inst = this;
		inst.#n++;
		++inst.#n;
		o.#n--;
		return inst.#n;
	}

	static s(o) {
		o.#n++;
	}
}
