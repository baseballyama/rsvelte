export class C {
	#n = $state({ v: 1 });
	m() {
		++this.#n.v;
		--this.#n[0];
	}
}
