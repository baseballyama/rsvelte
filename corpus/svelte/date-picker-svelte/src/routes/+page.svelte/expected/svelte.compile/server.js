import * as $ from 'svelte/internal/server';
import DemoDatePicker from './DemoDatePicker.svelte';
import DemoDateInput from './DemoDateInput.svelte';
import { Color } from 'color-picker-svelte';
import Prop from './prop.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function readCssVar(name) {
			const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

			return new Color(value);
		}

		function getCssVars() {
			if (typeof document === 'undefined') {
				return {};
			}

			return {
				'--date-picker-foreground': readCssVar('--date-picker-foreground'),
				'--date-picker-background': readCssVar('--date-picker-background'),
				'--date-picker-highlight-border': readCssVar('--date-picker-highlight-border'),
				'--date-picker-highlight-shadow': readCssVar('--date-picker-highlight-shadow'),
				'--date-picker-today-border': readCssVar('--date-picker-today-border'),
				'--date-picker-selected-color': readCssVar('--date-picker-selected-color'),
				'--date-picker-selected-background': readCssVar('--date-picker-selected-background')
			};
		}

		let cssVars = getCssVars();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1uha8ag', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Date Picker Svelte</title>`);
				});
			});

			$$renderer.push(`<p>Date and time picker for Svelte</p> <p>Features:</p> <ul><li>Theming</li> <li>Custom formats</li> <li>Internationalization (i18n)</li> <li>Autopunctuation (e.g typing "20201111111111" gives you "2020-11-11 11:11:11" with the default
		format)</li> <li>Keyboard shortcuts</li></ul> <h2 id="install">Install</h2> <pre class="language-">npm install -D date-picker-svelte</pre> <div${$.attr_style(Object.entries(cssVars).map(([key, value]) => {
				if (value === null) {
					return null;
				}

				return `${key}: ${value.toHex8String()};`;
			}).join(''))}><h2 id="dateinput">DateInput</h2> `);

			DemoDateInput($$renderer, {});
			$$renderer.push(`<!----> <h2 id="datepicker">DatePicker</h2> `);
			DemoDatePicker($$renderer, {});
			$$renderer.push(`<!----></div> <h2>Theming</h2> <div class="theming svelte-1uha8ag">`);

			Prop($$renderer, {
				label: '--date-picker-foreground',
				labelWide: true,
				get value() {
					return cssVars['--date-picker-foreground'];
				},

				set value($$value) {
					cssVars['--date-picker-foreground'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Prop($$renderer, {
				label: '--date-picker-background',
				labelWide: true,
				get value() {
					return cssVars['--date-picker-background'];
				},

				set value($$value) {
					cssVars['--date-picker-background'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Prop($$renderer, {
				label: '--date-picker-highlight-border',
				labelWide: true,
				get value() {
					return cssVars['--date-picker-highlight-border'];
				},

				set value($$value) {
					cssVars['--date-picker-highlight-border'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Prop($$renderer, {
				label: '--date-picker-highlight-shadow',
				labelWide: true,
				get value() {
					return cssVars['--date-picker-highlight-shadow'];
				},

				set value($$value) {
					cssVars['--date-picker-highlight-shadow'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Prop($$renderer, {
				label: '--date-picker-today-border',
				labelWide: true,
				get value() {
					return cssVars['--date-picker-today-border'];
				},

				set value($$value) {
					cssVars['--date-picker-today-border'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Prop($$renderer, {
				label: '--date-picker-selected-color',
				labelWide: true,
				get value() {
					return cssVars['--date-picker-selected-color'];
				},

				set value($$value) {
					cssVars['--date-picker-selected-color'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Prop($$renderer, {
				label: '--date-picker-selected-background',
				labelWide: true,
				get value() {
					return cssVars['--date-picker-selected-background'];
				},

				set value($$value) {
					cssVars['--date-picker-selected-background'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}