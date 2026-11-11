export class R {
	#s = $state(1);
	#f = $state.raw({});

	m(o) {
		const inst = this;
		const c = o.#f?.bar;
	}
}
