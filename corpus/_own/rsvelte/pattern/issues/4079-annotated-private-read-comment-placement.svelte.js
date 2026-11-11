export class C {
	#raw = $state.raw(null);
	#items = $state([]);
	#derived = $derived.by(() => 1);

	read_annotated() {
		return /** @type {string} */ (this.#raw);
	}

	read_annotated_no_parens() {
		return /** @type {string} */ this.#raw;
	}

	read_annotated_derived() {
		const v = /** @type {string} */ (this.#derived);
		return v;
	}

	read_annotated_argument() {
		return String(/** @type {string} */ (this.#raw));
	}

	read_annotated_nested_parens() {
		return /** @type {string} */ ((this.#raw));
	}

	read_line_comment() {
		return (
			// why this is a string
			this.#raw
		);
	}

	read_annotated_chain() {
		return /** @type {string} */ (this.#derived).toString();
	}

	read_plain() {
		return (this.#raw);
	}

	read_plain_local() {
		const local = 1;
		return /** @type {string} */ (local);
	}
}
