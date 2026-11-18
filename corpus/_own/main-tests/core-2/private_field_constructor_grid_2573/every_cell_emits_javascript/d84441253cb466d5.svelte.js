export class R {
	#s = $state(1);
	#f = $state(0);

	constructor(o) {
		const inst = this;
		o.#f &&= 5;
	}
}
