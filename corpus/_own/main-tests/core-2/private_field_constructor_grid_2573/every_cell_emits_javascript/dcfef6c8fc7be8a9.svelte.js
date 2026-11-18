export class R {
	#s = $state(1);
	#f = $derived(this.#s * 2);

	m(o) {
		const inst = this;
		++this.#f;
	}
}
