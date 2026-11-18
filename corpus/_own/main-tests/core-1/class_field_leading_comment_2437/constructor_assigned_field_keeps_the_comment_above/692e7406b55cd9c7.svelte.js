export class Counter {
	// c
	#n = $state(0);
	constructor() {
		this.#n = 1;
	}
	get n() {
		return this.#n;
	}
}
