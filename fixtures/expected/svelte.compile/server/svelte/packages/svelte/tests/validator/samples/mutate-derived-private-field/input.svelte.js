import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Test {
			#der = $.derived(() => ({ test: 0 }));

			set test(v) {
				this.#der().test = 45;
			}
		}
	});
}