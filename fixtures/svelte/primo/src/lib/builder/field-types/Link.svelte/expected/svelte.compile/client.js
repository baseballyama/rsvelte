import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as _ from 'lodash-es';
import Icon from '@iconify/svelte';
import UI from '../ui';
import { watch } from 'runed';
import { site_context } from '$lib/builder/stores/context';

var root = $.from_html(`<div class="Link svelte-1izzlya"><div class="inputs svelte-1izzlya"><!> <div class="url-select svelte-1izzlya"><div class="toggle svelte-1izzlya"><button type="button"><!> <span>Page</span></button> <button type="button"><!> <span>URL</span></button></div> <!></div></div></div>`);

export default function Link($$anchor, $$props) {
	$.push($$props, true);

	const default_value = { label: '', url: '', page: null };
	const default_entry = { value: default_value };
	const { value: site } = site_context.getOr({ value: null });
	const entry = $.derived(() => $$props.entry || default_entry);
	const all_pages = $.derived(() => site?.pages() ?? []);

	// Build hierarchical page list with visual indicators for subpages
	const selectable_pages = $.derived(() => {
		if (!$.get(all_pages).length) return [];

		const homepage = site?.homepage();

		if (!homepage) return $.get(all_pages).sort((a, b) => a.index - b.index);

		const result = [];

		function add_descendants(page, depth = 0) {
			const arrows = depth > 0 ? ('↳ ').repeat(depth) : '';

			result.push({ ...page, label: `${arrows}${page.name}`, value: page.id });

			// Get and sort children
			const children = $.get(all_pages).filter((p) => p.parent === page.id).sort((a, b) => a.index - b.index);

			for (const child of children) {
				add_descendants(child, depth + 1);
			}
		}

		// Add homepage (no arrow)
		result.push({ ...homepage, label: homepage.name, value: homepage.id });

		// Get homepage's direct children (same level as homepage, no arrows)
		const top_level_children = $.get(all_pages).filter((p) => p.parent === homepage.id).sort((a, b) => a.index - b.index);

		// For each top-level child, add it and its descendants
		for (const child of top_level_children) {
			result.push({ ...child, label: child.name, value: child.id });

			// Add this child's descendants with arrows
			const grandchildren = $.get(all_pages).filter((p) => p.parent === child.id).sort((a, b) => a.index - b.index);

			for (const grandchild of grandchildren) {
				add_descendants(grandchild, 1);
			}
		}

		return result;
	});

	// Auto-select first page on open
	let auto_selected_page = $.state(false);

	watch(() => $.get(selectable_pages), () => {
		const top_page = $.get(selectable_pages)[0];

		if (!top_page || $.get(auto_selected_page)) return;

		const has_url = $.get(entry)?.value?.url;
		const has_page = $.get(entry)?.value?.page;

		if (!has_url && !has_page && $.get(selected) === 'page') {
			$$props.onchange({
				[$$props.field.key]: { 0: { value: { ...$.get(entry).value, page: top_page.id } } }
			});

			$.set(auto_selected_page, true);
		}
	});

	let selected = $.derived(() => $.get(entry)?.value?.url ? 'url' : 'page');
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $.get(entry)?.value?.label);

		$.component(node, () => UI.TextInput, ($$anchor, UI_TextInput) => {
			UI_TextInput($$anchor, {
				get label() {
					return $$props.field.label;
				},

				oninput: (text) => {
					$$props.onchange({
						[$$props.field.key]: { 0: { value: { ...$.get(entry).value, label: text } } }
					});
				},

				get value() {
					return $.get($0);
				},
				id: 'page-label',
				placeholder: 'About Us'
			});
		});
	}

	var div_2 = $.sibling(node, 2);
	var div_3 = $.child(div_2);
	var button = $.child(div_3);
	let classes;
	var node_1 = $.child(button);

	Icon(node_1, { icon: 'iconoir:multiple-pages' });
	$.next(2);
	$.reset(button);

	var button_1 = $.sibling(button, 2);
	let classes_1;
	var node_2 = $.child(button_1);

	Icon(node_2, { icon: 'akar-icons:link-chain' });
	$.next(2);
	$.reset(button_1);
	$.reset(div_3);

	var node_3 = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_4 = $.first_child(fragment);

			{
				let $0 = $.derived(() => $.get(entry)?.value?.page);

				$.component(node_4, () => UI.Select, ($$anchor, UI_Select) => {
					UI_Select($$anchor, {
						fullwidth: true,
						get value() {
							return $.get($0);
						},

						get options() {
							return $.get(selectable_pages);
						},

						$$events: {
							input: ({ detail: pageId }) => {
								const page = $.get(all_pages).find((p) => p.id === pageId);

								if (page) {
									$$props.onchange({
										[$$props.field.key]: {
											0: {
												value: { ...$.get(entry).value, page: page.id, url: undefined }
											}
										}
									});
								}
							}
						}
					});
				});
			}

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_5 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => $.get(entry)?.value?.url);

				$.component(node_5, () => UI.TextInput, ($$anchor, UI_TextInput_1) => {
					UI_TextInput_1($$anchor, {
						oninput: (text) => {
							$$props.onchange({
								[$$props.field.key]: {
									0: { value: { ...$.get(entry).value, url: text, page: undefined } }
								}
							});
						},

						onblur: () => {
							// auto-set https protocol only if no protocol exists and it's not a relative URL
							const text = $.get(entry)?.value?.url;

							if (!text) return;

							const has_protocol = text.includes('://');
							const is_relative = text.startsWith('/') || text.startsWith('#');

							if (!has_protocol && !is_relative) {
								const url_with_protocol = `https://${text}`;

								$$props.onchange({
									[$$props.field.key]: {
										0: {
											value: {
												...$.get(entry).value,
												url: url_with_protocol,
												page: undefined
											}
										}
									}
								});
							}
						},

						get value() {
							return $.get($0);
						},
						type: 'url',
						placeholder: 'https://example.com'
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node_3, ($$render) => {
			if ($.get(selected) === 'page') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(button, 1, 'svelte-1izzlya', null, classes, { active: $.get(selected) === 'page' });
		classes_1 = $.set_class(button_1, 1, 'svelte-1izzlya', null, classes_1, { active: $.get(selected) === 'url' });
	});

	$.delegated('click', button, () => $.set(selected, 'page'));
	$.delegated('click', button_1, () => $.set(selected, 'url'));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);