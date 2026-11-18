export class R {
	#s = $state(1);
	#f = $state.raw({});

	constructor(o) {
		const inst = this;
		if (o) {
			const b = inst.#f.foo;
		}
	}
}
