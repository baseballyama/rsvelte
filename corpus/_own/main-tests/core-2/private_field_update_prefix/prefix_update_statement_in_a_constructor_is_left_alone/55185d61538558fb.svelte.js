export class Desk {
	history = $state([]);
	#historyGeneration = 0;
	constructor() {
		++this.#historyGeneration;
		--this.#historyGeneration;
	}
}
