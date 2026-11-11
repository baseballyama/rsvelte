export class R {
	#s = $state(1);
	#f = $state.raw({});

	constructor(o) {
		const inst = this;
		inst.#f -= 1;
	}
}
