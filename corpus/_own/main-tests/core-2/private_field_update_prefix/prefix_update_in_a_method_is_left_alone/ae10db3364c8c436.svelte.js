export class Desk {
	history = $state([]);
	#historyGeneration = 0;
	bump() {
		++this.#historyGeneration;
		--this.#historyGeneration;
		return ++this.#historyGeneration;
	}
	drop() {
		return --this.#historyGeneration;
	}
}
