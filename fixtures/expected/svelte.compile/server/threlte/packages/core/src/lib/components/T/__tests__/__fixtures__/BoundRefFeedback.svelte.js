import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function BoundRefFeedback($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ref = void 0;
		let width = 1;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.BoxGeometry) {
				$$renderer.push('<!--[-->');

				T.BoxGeometry($$renderer, {
					args: [width, 1, 1],
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}