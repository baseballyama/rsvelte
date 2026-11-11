const D = 5;
const OBJ = { a: 1 };
export class K {
	#a = $state(D);
	get a() { return this.#a; }
}
