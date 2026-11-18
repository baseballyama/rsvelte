export class R {
	#n = $state(0);

	constructor(s) {
		const inst = this;
		inst.#n += 1;
		setTimeout(() => {
			inst.#n += 2;
			inst.#n ??= s;
			const a = inst.#n;
		});
	}
}
