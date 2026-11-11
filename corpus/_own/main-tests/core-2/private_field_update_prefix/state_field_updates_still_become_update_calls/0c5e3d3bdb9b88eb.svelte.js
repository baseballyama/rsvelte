export class Counter {
	count = $state(0);
	#total = $state(0);
	inc() {
		++this.#total;
		--this.#total;
		return ++this.#total;
	}
}
