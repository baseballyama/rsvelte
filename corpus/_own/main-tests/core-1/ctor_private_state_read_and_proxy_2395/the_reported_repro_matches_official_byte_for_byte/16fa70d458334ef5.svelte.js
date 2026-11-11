export class R {
	#x = $state.raw({});
	#n = $state(0);

	constructor(s) {
		this.#x ??= { a: s, b: s };
		this.#n += 1;
	}
}
