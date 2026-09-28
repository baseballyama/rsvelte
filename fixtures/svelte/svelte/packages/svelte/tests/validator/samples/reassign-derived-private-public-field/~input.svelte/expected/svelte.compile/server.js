import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Test {
			#deps = () => [];

			#_deps = $.derived(() => {
				return [];
			});

			get deps() {
				return this.#_deps();
			}

			set deps($$value) {
				return this.#_deps($$value);
			}

			constructor(f = () => []) {
				this.#deps = f;
			}
		}
	});
}