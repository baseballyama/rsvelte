import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import * as _ from 'lodash-es';
import { fade } from 'svelte/transition';
import Icon from '@iconify/svelte';
import { clickOutside, createUniqueID } from '../utilities.js';
import { createPopperActions } from 'svelte-popperjs';
import { offsetByFixedParents } from '../utils/popper-fix';

export default function Select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		/**
		 * @typedef {Object} Props
		 * @property {string} [icon]
		 * @property {string} [label]
		 * @property {any} [options]
		 * @property {any} [value]
		 * @property {any} [fallback_label]
		 * @property {any} [dividers]
		 * @property {string} [placement]
		 * @property {string} [variant]
		 * @property {boolean} [fullwidth]
		 * @property {boolean} [loading]
		 * @property {boolean} [disable_auto_highlight]
		 */
		/** @type {Props} */
		let {
			icon = '',
			label = '',
			options = [],
			value = options[0]?.['value'],
			fallback_label = null,
			dividers = [],
			placement = 'bottom-start',
			variant = 'small',
			fullwidth = false,
			loading = false,
			disable_auto_highlight = false
		} = $$props;

		const [popperRef, popperContent] = createPopperActions({
			placement,
			strategy: 'fixed',
			modifiers: fullwidth
				? [
					offsetByFixedParents,
					{ name: 'offset', options: { offset: [0, 3] } },
					{
						name: 'sameWidth',
						enabled: true,
						fn: ({ state }) => {
							state.styles.popper.width = `${state.rects.reference.width}px`;
						},
						phase: 'beforeWrite',
						requires: ['computeStyles']
					}
				]
				: [
					offsetByFixedParents,
					{ name: 'offset', options: { offset: [0, 3] } }
				]
		});

		let showing_dropdown = false;
		let active_submenu = null;
		let selected_submenu_option = null;
		const select_id = createUniqueID();

		function find_with_object(options, value) {
			let selected;

			for (const option of options) {
				const selected_suboption = option.suboptions?.find((sub) => sub.value === value);

				if (selected_suboption) {
					selected = selected_suboption;
				} else if (option.value === value) {
					selected = option;
				}
			}

			return selected;
		}

		options.find((option) => {
			const selected_suboption = option.suboptions?.find((sub) => sub.value === value);

			return option.value === value || selected_suboption;
		});

		// highlight button when passed value changes (i.e. when auto-changing field type based on name)
		let highlighted = false;

		let disable_highlight = true; // prevent highlighting on initial value set
		let manually_selected = false; // or manual set
		let last_value = value;

		function highlight_button(val) {
			if (disable_auto_highlight) {
				return;
			}

			if (disable_highlight) {
				disable_highlight = false;

				return;
			} else if (!manually_selected && val !== last_value) {
				highlighted = true;
				last_value = val;

				setTimeout(
					() => {
						highlighted = false;
					},
					400
				);
			}
		}

		let selected = $.derived(() => find_with_object(options, value));

		$$renderer.push(`<div${$.attr_class(`Select ${$.stringify(variant)}`, 'svelte-fn7uzq')} role="menu"><div class="select-container svelte-fn7uzq">`);

		if (label) {
			$$renderer.push(`<!--[0--><label class="primo--field-label"${$.attr('for', select_id)}>`);

			if (icon) {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { icon });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <span>${$.escape(label)}</span></label>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button${$.attr('id', select_id)}${$.attr_class('primary svelte-fn7uzq', void 0, { 'highlighted': highlighted })} type="button">`);

		if (loading) {
			$$renderer.push(`<!--[0--><div style="padding: 3.5px;">`);
			Icon($$renderer, { icon: 'line-md:loading-twotone-loop' });
			$$renderer.push(`<!----></div>`);
		} else if (selected()) {
			$$renderer.push('<!--[1-->');

			if (selected().icon) {
				$$renderer.push(`<!--[0--><div class="icon svelte-fn7uzq">`);
				Icon($$renderer, { icon: selected().icon });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <p class="svelte-fn7uzq">${$.escape(selected().label)}</p>`);
		} else if (fallback_label) {
			$$renderer.push(`<!--[2--><p class="svelte-fn7uzq">${$.escape(fallback_label)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span class="dropdown-icon svelte-fn7uzq">`);
		Icon($$renderer, { icon: 'mi:select' });
		$$renderer.push(`<!----></span></button></div> `);

		if (showing_dropdown) {
			$$renderer.push(`<!--[0--><div class="popup svelte-fn7uzq">`);

			if (!active_submenu) {
				$$renderer.push(`<!--[0--><div class="options svelte-fn7uzq"><!--[-->`);

				const each_array = $.ensure_array_like(options);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let option = each_array[i];
					const has_submenu_items = option.suboptions?.length > 0;

					$$renderer.push(`<div class="item svelte-fn7uzq"><button${$.attr('disabled', option.disabled, true)} type="button"${$.attr_class('svelte-fn7uzq', void 0, { 'active': label === option.label })}>`);
					Icon($$renderer, { icon: option.icon });
					$$renderer.push(`<!----> <span>${$.escape(option.label)}</span></button> `);

					if (has_submenu_items) {
						$$renderer.push(`<!--[0--><button class="svelte-fn7uzq">`);
						Icon($$renderer, { icon: 'material-symbols:chevron-right' });
						$$renderer.push(`<!----></button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> `);

					if (dividers.includes(i)) {
						$$renderer.push(`<!--[0--><hr class="svelte-fn7uzq"/>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else if (active_submenu) {
				$$renderer.push(`<!--[1--><div class="submenu svelte-fn7uzq"><header class="svelte-fn7uzq"><span class="svelte-fn7uzq">${$.escape(active_submenu.title)}</span> <button type="button" class="svelte-fn7uzq">`);
				Icon($$renderer, { icon: 'carbon:close' });
				$$renderer.push(`<!----></button></header> <div class="options svelte-fn7uzq">`);

				if (typeof options === 'function') {
					$$renderer.push('<!--[0-->');
				} else {
					$$renderer.push(`<!--[-1--><!--[-->`);

					const each_array_1 = $.ensure_array_like(active_submenu.options);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let { label, value, onclick } = each_array_1[$$index_1];

						$$renderer.push(`<div class="item svelte-fn7uzq"><button type="button" class="svelte-fn7uzq">${$.escape(label)}</button></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}