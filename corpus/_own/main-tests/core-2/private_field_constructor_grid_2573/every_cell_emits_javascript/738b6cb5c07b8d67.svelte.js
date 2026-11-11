export class R {
	#s = $state(1);
	#f = $derived.by(() => this.#s * 2);

	m(o) {
		const inst = this;
		this.#f = { a: 1 };
	}
}
