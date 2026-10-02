import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import * as _ from 'lodash-es';
import Icon from '@iconify/svelte';
import { processCode } from '$lib/builder/utils';
import * as Components from '$lib/builder/components';

export default function Site_Symbol($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {any} symbol
		 * @property {any} site
		 * @property {string} [append]
		 * @property {boolean} [checked]
		 * @property {() => void} onclick
		 * @property {() => void} onmousedown
		 * @property {() => void} onmouseup
		 */
		/** @type {Props} */
		let {
			symbol = void 0,
			site,
			append = '',
			checked = false,
			onclick,
			onmousedown,
			onmouseup
		} = $$props;

		let name_el;
		let renaming = false;

		async function toggle_name_input() {
			renaming = !renaming;

			// workaround for inability to see cursor when div empty
			if (symbol.name === '') {
				symbol.name = 'Block';
			}
		}

		let height = 0;
		let componentCode = void 0;
		let cachedSymbol = {};
		let component_error = void 0;

		async function compile_component_code(symbol, language) {
			if (_.isEqual(cachedSymbol.code, symbol.code) && _.isEqual(cachedSymbol.entries, symbol.entries)) {
				return;
			}

			let res = await processCode({
				component: {
					head: site.code.head,
					css: symbol.code.css,
					html: symbol.code.html,
					data: symbol.entries[language]
				},
				buildStatic: true,
				hydrated: true
			});

			if (res.error) {
				component_error = res.error;
			} else {
				component_error = null;
				res.css = res.css;
				componentCode = res;
				cachedSymbol = _.cloneDeep({ code: symbol.code, entries: symbol.entries });
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<button class="sidebar-symbol svelte-1w96kt8"><div class="symbol svelte-1w96kt8">`);

			if (checked) {
				$$renderer.push(`<!--[0--><div class="check svelte-1w96kt8">`);
				Icon($$renderer, { icon: 'material-symbols:check' });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (component_error) {
				$$renderer.push(`<!--[0--><div class="error svelte-1w96kt8">`);
				Icon($$renderer, { icon: 'bxs:error' });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push(`<!--[-1--><!---->`);

				{
					if (Components.IFrame) {
						$$renderer.push('<!--[-->');

						Components.IFrame($$renderer, {
							append,
							componentCode,
							get height() {
								return height;
							},

							set height($$value) {
								height = $$value;
								$$settled = false;
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></div></button>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { symbol });
	});
}