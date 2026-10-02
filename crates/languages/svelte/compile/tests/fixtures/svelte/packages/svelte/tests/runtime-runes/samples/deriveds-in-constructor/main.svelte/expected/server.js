import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Foo {
			#state = 'state';
			#derived = $.derived(() => 'derived ' + this.#state);

			#derivedBy = $.derived(() => {
				return 'derived.by ' + this.#derived();
			});

			initial;

			constructor() {
				this.initial = [this.#state, this.#derived(), this.#derivedBy()];
			}
		}

		const foo = new Foo();

		$$renderer.push(`<p>${$.escape(foo.initial)}</p>`);
	});
}