export class Desk {
	history = $state(1);
	#historyGeneration = 2;
	constructor() {
		this.total = $derived(this.#historyGeneration + this.history);
	}
}
