import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="icon-picker" style="position: absolute;
    background: var(--color-gray-9);
    padding: 1rem;z-index: 9;    bottom: 12rem;
    left: 6rem;"><!></div>`);

var root_1 = $.from_html(`<button type="button" class="color-option svelte-1ldfa0q" aria-label="Select color"><!></button>`);
var root_2 = $.from_html(`<div class="color-picker svelte-1ldfa0q"><div class="color-grid svelte-1ldfa0q"></div></div>`);

var root_3 = $.from_html(`<form class="svelte-1ldfa0q"><div style="width: 100%"><div class="top svelte-1ldfa0q"><!> <button style="display: flex;
				align-items: center;
				justify-content: center;
				position: relative;
				margin-top: 22px;" type="button" aria-label="Select page type icon"><span class="icon" style="    width: 2rem;
				aspect-ratio: 1;
				border-radius: 50%;
				background: var(--color-gray-8);
				display: flex;
				align-items: center;
				justify-content: center;"><!></span></button> <button style="display: flex;
				align-items: center;
				justify-content: center;
				position: relative;
				margin-top: 22px;" type="button" aria-label="Select page type color"><span class="preview"></span></button> <button class="save svelte-1ldfa0q" type="submit"><!></button></div> <!> <!></div></form>`);

export default function PageTypeForm($$anchor, $$props) {
	$.push($$props, true);

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
	let initial_name = $.prop($$props, 'new_page_name', 3, ''),
		initial_color = $.prop($$props, 'new_color', 3, '#2B407D'),
		initial_icon = $.prop($$props, 'new_icon', 3, 'iconoir:page');

	// Local state initialized from props, won't be overwritten by parent updates
	let new_page_name = $.state($.proxy(initial_name()));

	let new_color = $.state($.proxy(initial_color()));
	let new_icon = $.state($.proxy(initial_icon()));
	let page_creation_disabled = $.derived(() => !$.get(new_page_name));

	const new_page_details = $.derived(() => ({
		name: $.get(new_page_name),
		color: $.get(new_color),
		icon: $.get(new_icon),
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

	let showing_icon_picker = $.state(false);
	let showing_color_picker = $.state(false);

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
	if (initial_name() === '' && site) {
		const existing_page_types = site?.page_types() || [];
		const used_colors = new Set(existing_page_types.map((pt) => pt.color));
		const unused_color = color_options.find((color) => !used_colors.has(color));

		// Set the first unused color as default
		if (unused_color) {
			$.set(new_color, unused_color, true);
		}
	}

	var form = root_3();
	var div = $.child(form);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.component(node, () => UI.TextInput, ($$anchor, UI_TextInput) => {
		UI_TextInput($$anchor, {
			autofocus: true,
			id: 'page-label',
			label: 'Page Type Name',
			placeholder: 'Post',
			get value() {
				return $.get(new_page_name);
			},

			set value($$value) {
				$.set(new_page_name, $$value, true);
			}
		});
	});

	var button = $.sibling(node, 2);
	var span = $.child(button);
	var node_1 = $.child(span);

	Icon(node_1, {
		get icon() {
			return $.get(new_icon);
		}
	});

	$.reset(span);
	$.reset(button);
	$.action(button, ($$node) => popperRef?.($$node));

	var button_1 = $.sibling(button, 2);
	var span_1 = $.only_child(button_1);

	$.action(button_1, ($$node) => colorPopperRef?.($$node));

	var button_2 = $.sibling(button_1, 2);
	var node_2 = $.child(button_2);

	Icon(node_2, { icon: 'akar-icons:check' });
	$.reset(button_2);
	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_4 = $.child(div_2);

			IconPicker(node_4, {
				get search_query() {
					return $.get(new_page_name);
				},

				get icon() {
					return $.get(new_icon);
				},

				$$events: {
					input: (e) => {
						$.set(new_icon, e.detail, true);
					}
				}
			});

			$.reset(div_2);
			$.action(div_2, ($$node) => popperContent?.($$node));
			$.action(div_2, ($$node) => clickOutside?.($$node));
			$.event('click_outside', div_2, () => $.set(showing_icon_picker, false));
			$.append($$anchor, div_2);
		};

		$.if(node_3, ($$render) => {
			if ($.get(showing_icon_picker)) $$render(consequent);
		});
	}

	var node_5 = $.sibling(node_3, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_3 = root_2();
			var div_4 = $.child(div_3);

			$.each(div_4, 21, () => color_options, $.index, ($$anchor, color) => {
				const page_type = $.derived(() => get_page_type_using_color($.get(color)));
				var button_3 = root_1();
				let styles;
				var node_6 = $.child(button_3);

				{
					var consequent_1 = ($$anchor) => {
						Icon($$anchor, {
							icon: 'akar-icons:check',
							style: 'color: white; font-size: 0.875rem;'
						});
					};

					var consequent_2 = ($$anchor) => {
						Icon($$anchor, {
							get icon() {
								return $.get(page_type).icon;
							},
							style: 'color: white; font-size: 0.875rem;'
						});
					};

					$.if(node_6, ($$render) => {
						if ($.get(new_color) === $.get(color)) $$render(consequent_1); else if ($.get(page_type)) $$render(consequent_2, 1);
					});
				}

				$.reset(button_3);

				$.template_effect(() => {
					$.set_attribute(button_3, 'title', $.get(page_type) ? `Used by ${$.get(page_type).name}` : '');
					styles = $.set_style(button_3, '', styles, { 'background-color': $.get(color) });
				});

				$.delegated('click', button_3, () => {
					$.set(new_color, $.get(color), true);
					$.set(showing_color_picker, false);
				});

				$.append($$anchor, button_3);
			});

			$.reset(div_4);
			$.reset(div_3);
			$.action(div_3, ($$node) => colorPopperContent?.($$node));
			$.action(div_3, ($$node) => clickOutside?.($$node));
			$.event('click_outside', div_3, () => $.set(showing_color_picker, false));
			$.append($$anchor, div_3);
		};

		$.if(node_5, ($$render) => {
			if ($.get(showing_color_picker)) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.reset(form);

	$.template_effect(() => {
		$.set_style(span_1, `width: 2rem;
					aspect-ratio: 1;
					border-radius: 50%;
					display: block;
					background-color: ${$.get(new_color) ?? ''};`);

		button_2.disabled = $.get(page_creation_disabled);
	});

	$.event('submit', form, (e) => {
		e.preventDefault();
		dispatch('create', $.get(new_page_details));
	});

	$.delegated('click', button, () => $.set(showing_icon_picker, true));
	$.delegated('click', button_1, () => $.set(showing_color_picker, true));
	$.transition(1, form, () => fade, () => ({ duration: 100 }));
	$.append($$anchor, form);
	$.pop();
}

$.delegate(['click']);