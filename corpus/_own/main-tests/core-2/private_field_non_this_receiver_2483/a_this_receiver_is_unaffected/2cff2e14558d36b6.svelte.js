export class R {
	#n = $state(0);

	m() {
		this.#n++;
		--this.#n;
	}
}
