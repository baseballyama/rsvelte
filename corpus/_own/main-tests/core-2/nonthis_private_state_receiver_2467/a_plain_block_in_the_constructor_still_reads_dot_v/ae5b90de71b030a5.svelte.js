export class R {
	#n = $state(0);

	constructor(s) {
		const inst = this;
		if (s) {
			inst.#n += 1;
		}
		for (const q of s) {
			inst.#n <<= 1;
		}
	}
}
