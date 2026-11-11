export class Q {
	#promise = $state.raw(null);

	#get_promise() {
		void (this.#promise ??= 1);
		return this.#promise;
	}

	msg = `line one ${ 1 }
line two ${ 2 }`;
}
