export class R {
	#a = $state(1);
	#d = $derived.by(() => this.#a * 2);

	constructor() {
		this.#d++;
		this.#d--;
		++this.#d;
		--this.#d;
		this.#d &= 5;
		this.#d >>>= 5;
		this.#d ??= 5;
		this.#d ||= 5;
		this.#d = 3;
		log(this.#d);
	}
}
