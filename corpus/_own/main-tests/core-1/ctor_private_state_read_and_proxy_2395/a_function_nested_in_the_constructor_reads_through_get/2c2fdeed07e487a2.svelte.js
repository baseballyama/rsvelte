export class R {
	#n = $state(0);

	constructor(s) {
		this.#n += 1;
		setTimeout(() => {
			this.#n += 2;
			this.#n ??= s;
		});
	}
}
