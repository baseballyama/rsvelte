export class R {
	#n = $state(0);

	constructor(s) {
		if (s) {
			this.#n += 1;
		}
		for (const q of s) {
			this.#n <<= 1;
		}
	}
}
