import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class X {
			#in_constructor;

			get in_constructor() {
				return this.#in_constructor();
			}

			set in_constructor($$value) {
				return this.#in_constructor($$value);
			}

			x = 1;
			#on_class = $.derived(() => this.x * 2);

			get on_class() {
				return this.#on_class();
			}

			set on_class($$value) {
				return this.#on_class($$value);
			}

			#on_class_private = $.derived(() => this.x * 2);
			#in_constructor_private;

			constructor() {
				this.#in_constructor_private = $.derived(() => this.x * 2);
				this.#in_constructor = $.derived(() => this.x * 2);
				this.#on_class_private(3);
				this.#in_constructor_private(3);
			}

			get on_class_private() {
				return this.#on_class_private();
			}

			get in_constructor_private() {
				return this.#in_constructor_private();
			}
		}

		const x = new X();

		x.on_class = 3;
		x.in_constructor = 3;
		$$renderer.push(`<!---->${$.escape(x.on_class)} ${$.escape(x.in_constructor)} ${$.escape(x.on_class_private)} ${$.escape(x.in_constructor_private)}`);
	});
}