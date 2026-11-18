export class R {
	#s = $state(1);
	#f = $derived(this.#s * 2);

	constructor(o) {
		const inst = this;
		if (o) {
			o.#f -= 1;
		}
	}
}
