export class R {
	#s = $state(1);
	#f = $state(0);

	m(o) {
		const inst = this;
		inst.#f += 1;
	}
}
