export class R {
	#s = $state(1);
	#f = $derived.by(() => this.#s * 2);

	constructor(o) {
		const inst = this;
		if (o) {
			const a = this.#f;
		}
	}
}
