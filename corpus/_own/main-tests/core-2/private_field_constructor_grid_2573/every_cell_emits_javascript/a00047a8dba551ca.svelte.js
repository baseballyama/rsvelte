export class R {
	#s = $state(1);
	#f = $state(0);

	constructor(o) {
		const inst = this;
		if (o) {
			inst.#f &&= 5;
		}
	}
}
