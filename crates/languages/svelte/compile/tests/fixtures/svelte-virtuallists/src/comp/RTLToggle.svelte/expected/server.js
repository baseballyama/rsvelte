import * as $ from 'svelte/internal/server';
import ToggleButton from './ToggleButton.svelte';

export default function RTLToggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { isRTL = void 0 } = $$props;

		function clicked() {
			document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="input-output-toggle svelte-1pt4ts5">Direction: <span aria-hidden="true">LTR</span> `);

			ToggleButton($$renderer, {
				label: 'RTL direction',
				onclick: clicked,
				get pressed() {
					return isRTL;
				},

				set pressed($$value) {
					isRTL = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <span aria-hidden="true">RTL</span></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { isRTL });
	});
}