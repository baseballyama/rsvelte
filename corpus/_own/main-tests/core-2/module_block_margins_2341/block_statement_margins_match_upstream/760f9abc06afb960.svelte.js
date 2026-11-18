export class R {
	#x = $state({});

	constructor(s) {
		const b = 2;
		this.#x = s;
	}

	m(s) {
		const a = 1;
		return this.#x;
	}
}
