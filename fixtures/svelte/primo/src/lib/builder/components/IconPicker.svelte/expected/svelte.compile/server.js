import * as $ from 'svelte/internal/server';
import TextInput from '../ui/TextInput.svelte';
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';
import Icon from '@iconify/svelte';
import { createPopperActions } from 'svelte-popperjs';
import { clickOutside } from '../utilities';
import { offsetByFixedParents } from '../utils/popper-fix';

export default function IconPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		/**
		 * @typedef {Object} Props
		 * @property {any} [icon]
		 * @property {string} [search_query]
		 * @property {string} [variant]
		 * @property {any} [svg_preview]
		 */
		/** @type {Props} */
		let {
			icon,
			search_query = '',
			variant = 'large',
			svg_preview = null
		} = $$props;

		const [popperRef, popperContent] = createPopperActions({
			placement: 'bottom-start',
			strategy: 'fixed',
			modifiers: [offsetByFixedParents]
		});

		let searched = false;

		// search immediately when passed a query
		if (search_query) {
			search();
		}

		// Auto-search when search_query changes and has content
		let icons = [];

		async function search() {
			fetch(`https://api.iconify.design/search?query=${encodeURIComponent(search_query.trim())}&limit=200`).then((res) => res.json()).then((data) => {
				icons = data.icons;
				searched = true;
			});
		}

		let showing_popover = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class(`IconPicker ${$.stringify(variant)}`, 'svelte-mby8vt')}><div class="container svelte-mby8vt">`);

			if (variant === 'large') {
				$$renderer.push('<!--[0-->');

				if (svg_preview || icon) {
					$$renderer.push(`<!--[0--><div class="icon-preview svelte-mby8vt"><button class="svelte-mby8vt">`);
					Icon($$renderer, { icon: 'material-symbols:delete' });
					$$renderer.push(`<!----></button> `);

					if (svg_preview) {
						$$renderer.push(`<!--[0-->${$.html(svg_preview)}`);
					} else {
						$$renderer.push('<!--[-1-->');
						Icon($$renderer, { icon });
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <form class="svelte-mby8vt">`);

				TextInput($$renderer, {
					prefix_icon: 'tabler:search',
					button: { label: 'Search', type: 'submit', disabled: !search_query },
					get value() {
						return search_query;
					},

					set value($$value) {
						search_query = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></form>`);
			} else if (variant === 'small') {
				$$renderer.push(`<!--[1--><button class="icon-preview svelte-mby8vt" aria-label="select icon">`);
				Icon($$renderer, { icon });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (showing_popover) {
				$$renderer.push(`<!--[0--><div class="popup svelte-mby8vt"><form class="svelte-mby8vt">`);

				TextInput($$renderer, {
					autofocus: true,
					prefix_icon: 'tabler:search',
					label: 'Search icons',
					button: { label: 'Search', type: 'submit', disabled: !search_query },
					get value() {
						return search_query;
					},

					set value($$value) {
						search_query = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></form> `);

				if (searched) {
					$$renderer.push(`<!--[0--><div class="icons svelte-mby8vt"><button class="close svelte-mby8vt" aria-label="Close">`);
					Icon($$renderer, { icon: 'material-symbols:close' });
					$$renderer.push(`<!----></button> `);

					const each_array = $.ensure_array_like(icons);

					if (each_array.length !== 0) {
						$$renderer.push('<!--[-->');

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let item = each_array[$$index];

							$$renderer.push(`<button${$.attr_class('icon svelte-mby8vt', void 0, { 'active': item === icon })} type="button">`);
							Icon($$renderer, { icon: item, width: '50px' });
							$$renderer.push(`<!----></button>`);
						}
					} else {
						$$renderer.push(`<!--[!--><span style="grid-column: 1 / -1; padding: 0.5rem; font-size: 0.875rem; border-left: 3px solid red;">No icons found</span>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (searched && variant === 'large') {
				$$renderer.push(`<!--[0--><div class="icons svelte-mby8vt"><button class="close svelte-mby8vt" aria-label="Close">`);
				Icon($$renderer, { icon: 'material-symbols:close' });
				$$renderer.push(`<!----></button> `);

				const each_array_1 = $.ensure_array_like(icons);

				if (each_array_1.length !== 0) {
					$$renderer.push('<!--[-->');

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let item = each_array_1[$$index_1];

						$$renderer.push(`<button${$.attr_class('icon svelte-mby8vt', void 0, { 'active': item === icon })} type="button">`);
						Icon($$renderer, { icon: item, width: '50px' });
						$$renderer.push(`<!----></button>`);
					}
				} else {
					$$renderer.push(`<!--[!--><span style="grid-column: 1 / -1; padding: 0.5rem; font-size: 0.875rem; border-left: 3px solid red;">No icons found</span>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { search_query });
	});
}