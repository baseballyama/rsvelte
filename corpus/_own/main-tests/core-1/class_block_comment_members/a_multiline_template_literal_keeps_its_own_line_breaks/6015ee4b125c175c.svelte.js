export class Q {
	#promise = $state.raw(null);

	#run() {
		return Promise.resolve();
	}

	#get_promise() {
		void (this.#promise ??= this.#run());
		return this.#promise;
	}

	msg = `a ${ 1 } b
c ${ 2 } d`;
}
