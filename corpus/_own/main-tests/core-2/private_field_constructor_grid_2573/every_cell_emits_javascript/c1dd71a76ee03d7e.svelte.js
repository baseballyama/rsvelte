export class R {
	#s = $state(1);
	#f = $state.raw({});

	constructor(o) {
		const inst = this;
		setTimeout(() => {
			o.#f ||= 5;
		});
	}
}
