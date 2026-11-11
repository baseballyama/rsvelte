export class C {
	#a = $state(1);
	// c
	#d = $derived(this.#a * 2);
}
