import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';
import { watch } from 'runed';
import UI from '../../../ui/index.js';
import Icon from '@iconify/svelte';
import IconPicker from '../../../components/IconPicker.svelte';
import { clickOutside } from '../../../utilities.js';
import { createPopperActions } from 'svelte-popperjs';
import { offsetByFixedParents } from '$lib/builder/utils/popper-fix';
import { site_context } from '../../../stores/context.js';

export default function PageTypeForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();
		const { value: site } = site_context.get();

		const color_options = [
			'#2B407D', // Navy blue (default)
			'#5B8FA3', // Blue
			'#87CEEB', // Sky blue
			'#4A90E2', // Bright blue
			'#6B9BD2', // Light blue
			'#2ECC71', // Green
			'#27AE60', // Dark green
			'#52C9DC', // Cyan
			'#9B59B6', // Purple
			'#8E44AD', // Dark purple
			'#E74C3C', // Red
			'#C0392B', // Dark red
			'#E67E22', // Orange
			'#F39C12', // Gold
			'#F1C40F', // Yellow
			'#1ABC9C', // Turquoise
			'#16A085', // Dark turquoise
			'#95A5A6', // Gray
			'#34495E', // Dark gray
			'#E91E63' // Pink
		];

		/**
		 * @typedef {Object} Props
		 * @property {string} [new_page_name]
		 * @property {string} [new_color]
		 * @property {string} [new_icon]
		 */
		/** @type {Props} */
		let {
			new_page_name: initial_name = '',
			new_color: initial_color = '#2B407D',
			new_icon: initial_icon = 'iconoir:page'
		} = $$props;

		// Local state initialized from props, won't be overwritten by parent updates
		let new_page_name = initial_name;

		let new_color = initial_color;
		let new_icon = initial_icon;
		let page_creation_disabled = $.derived(() => !new_page_name);

		const new_page_details = $.derived(() => ({
			name: new_page_name,
			color: new_color,
			icon: new_icon,
			head: '',
			foot: ''
		}));

		const [popperRef, popperContent] = createPopperActions({
			placement: 'bottom',
			strategy: 'fixed',
			modifiers: [
				offsetByFixedParents,
				{ name: 'offset', options: { offset: [0, 3] } }
			]
		});

		let showing_icon_picker = false;
		let showing_color_picker = false;

		const [colorPopperRef, colorPopperContent] = createPopperActions({
			placement: 'bottom',
			strategy: 'fixed',
			modifiers: [
				offsetByFixedParents,
				{ name: 'offset', options: { offset: [0, 3] } }
			]
		});

		// Find which page type is using each color
		function get_page_type_using_color(color) {
			const existing_page_types = site?.page_types() || [];

			return existing_page_types.find((pt) => pt.color === color);
		}

		// Auto-select the first unused color once when creating a new page type
		if (initial_name === '' && site) {
			const existing_page_types = site?.page_types() || [];
			const used_colors = new Set(existing_page_types.map((pt) => pt.color));
			const unused_color = color_options.find((color) => !used_colors.has(color));

			// Set the first unused color as default
			if (unused_color) {
				new_color = unused_color;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<form class="svelte-1ldfa0q"><div style="width: 100%"><div class="top svelte-1ldfa0q">`);

			if (UI.TextInput) {
				$$renderer.push('<!--[-->');

				UI.TextInput($$renderer, {
					autofocus: true,
					id: 'page-label',
					label: 'Page Type Name',
					placeholder: 'Post',
					get value() {
						return new_page_name;
					},

					set value($$value) {
						new_page_name = $$value;
						$$settled = false;
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <button style="display: flex; align-items: center; justify-content: center; position: relative; margin-top: 22px;" type="button" aria-label="Select page type icon"><span class="icon" style="width: 2rem; aspect-ratio: 1; border-radius: 50%; background: var(--color-gray-8); display: flex; align-items: center; justify-content: center;">`);
			Icon($$renderer, { icon: new_icon });
			$$renderer.push(`<!----></span></button> <button style="display: flex; align-items: center; justify-content: center; position: relative; margin-top: 22px;" type="button" aria-label="Select page type color"><span class="preview"${$.attr_style(`width: 2rem; aspect-ratio: 1; border-radius: 50%; display: block; background-color: ${$.stringify(new_color)};`)}></span></button> <button class="save svelte-1ldfa0q"${$.attr('disabled', page_creation_disabled(), true)} type="submit">`);
			Icon($$renderer, { icon: 'akar-icons:check' });
			$$renderer.push(`<!----></button></div> `);

			if (showing_icon_picker) {
				$$renderer.push(`<!--[0--><div class="icon-picker" style="position: absolute; background: var(--color-gray-9); padding: 1rem;z-index: 9; bottom: 12rem; left: 6rem;">`);
				IconPicker($$renderer, { search_query: new_page_name, icon: new_icon });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showing_color_picker) {
				$$renderer.push(`<!--[0--><div class="color-picker svelte-1ldfa0q"><div class="color-grid svelte-1ldfa0q"><!--[-->`);

				const each_array = $.ensure_array_like(color_options);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let color = each_array[$$index];
					const page_type = get_page_type_using_color(color);

					$$renderer.push(`<button type="button" class="color-option svelte-1ldfa0q" aria-label="Select color"${$.attr('title', page_type ? `Used by ${page_type.name}` : '')}${$.attr_style('', { 'background-color': color })}>`);

					if (new_color === color) {
						$$renderer.push('<!--[0-->');

						Icon($$renderer, {
							icon: 'akar-icons:check',
							style: 'color: white; font-size: 0.875rem;'
						});
					} else if (page_type) {
						$$renderer.push('<!--[1-->');

						Icon($$renderer, {
							icon: page_type.icon,
							style: 'color: white; font-size: 0.875rem;'
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></button>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></form>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}