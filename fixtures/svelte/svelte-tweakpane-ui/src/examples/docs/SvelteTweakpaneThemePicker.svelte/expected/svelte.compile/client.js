import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { List, Pane, ThemeUtils } from '$lib';

export default function SvelteTweakpaneThemePicker($$anchor, $$props) {
	$.push($$props, true);

	let themeKey = 'standard';

	Pane($$anchor, {
		position: 'inline',
		get theme() {
			return ThemeUtils.presets[themeKey];
		},
		title: 'Theme Picker',
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => Object.keys(ThemeUtils.presets));

				List($$anchor, {
					label: 'Theme',
					get options() {
						return $.get($0);
					},

					get value() {
						return themeKey;
					},

					set value($$value) {
						themeKey = $$value;
					}
				});
			}
		},
		$$slots: { default: true }
	});

	$.pop();
}