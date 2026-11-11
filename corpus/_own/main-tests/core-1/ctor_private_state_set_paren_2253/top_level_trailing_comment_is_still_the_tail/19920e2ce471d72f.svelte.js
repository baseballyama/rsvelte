export class C {
	#current = $state();
	constructor(getter) {
		this.#current = getter(); // set the initial value
	}
}
