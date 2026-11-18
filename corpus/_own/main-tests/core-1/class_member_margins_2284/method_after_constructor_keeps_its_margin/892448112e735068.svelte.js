export class R {
	#x = $state({});

	constructor(s) {
		this.#x = s;
	}

	m(s) {
		return this.#x;
	}
}
