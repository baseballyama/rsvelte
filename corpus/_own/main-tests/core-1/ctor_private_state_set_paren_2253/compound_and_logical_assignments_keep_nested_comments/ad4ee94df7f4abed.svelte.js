export class R {
	#x = $state.raw({});
	#n = $state(0);

	constructor(s) {
		this.#x ??= {
			a: s,
			// c
			b: s
		};
		this.#n += [
			1,
			// c
			2
		].length;
	}
}
