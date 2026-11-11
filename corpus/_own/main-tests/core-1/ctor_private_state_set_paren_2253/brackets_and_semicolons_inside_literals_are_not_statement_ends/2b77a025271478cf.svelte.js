export class R {
	#x = $state.raw({});

	constructor(s) {
		this.#x = {
			f: () => { g(); },
			b: s
		};
	}
}
