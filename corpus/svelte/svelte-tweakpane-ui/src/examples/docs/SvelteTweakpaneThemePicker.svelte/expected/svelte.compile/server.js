import * as $ from 'svelte/internal/server';
import { List, Pane, ThemeUtils } from '$lib';

export default function SvelteTweakpaneThemePicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let themeKey = 'standard';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				position: 'inline',
				theme: ThemeUtils.presets[themeKey],
				title: 'Theme Picker',
				children: ($$renderer) => {
					List($$renderer, {
						label: 'Theme',
						options: Object.keys(ThemeUtils.presets),
						get value() {
							return themeKey;
						},

						set value($$value) {
							themeKey = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
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