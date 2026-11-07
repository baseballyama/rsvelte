import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function Bindable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { is, onRefCreate } = $$props;
		let ref = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, {
				is,
				get ref() {
					return ref;
				},

				set ref($$value) {
					ref = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}