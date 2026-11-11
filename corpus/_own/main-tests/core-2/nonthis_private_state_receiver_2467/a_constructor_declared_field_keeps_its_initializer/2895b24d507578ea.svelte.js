export class R {
	#c;
	#n = $state(0);

	constructor(s) {
		this.#c = $state(0);
		const inst = this;
		inst.#c += 2;
	}
}
