export class Q {
	#promise = $state.raw(null);

	#run() {
		return Promise.resolve();
	}

	#get_promise() {
		void (this.#promise ??= this.#run());
		return this.#promise;
	}

	/**
	 * A block comment spanning several lines used to be split into one member
	 * per line, which appended its opening `/**` to the block above and left
	 * that block unparseable.
	 */
	zzz() {}
}
