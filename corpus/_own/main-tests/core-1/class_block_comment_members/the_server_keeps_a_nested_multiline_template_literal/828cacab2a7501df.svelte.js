export class Q {
	#promise = $state.raw(null);

	#run() {
		return Promise.resolve();
	}

	#get_promise() {
		void (this.#promise ??= this.#run());
		return this.#promise;
	}

	tpl = `outer ${ `inner
still inner` } end`;
}
