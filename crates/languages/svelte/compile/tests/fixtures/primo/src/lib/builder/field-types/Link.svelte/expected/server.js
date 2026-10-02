import * as $ from 'svelte/internal/server';
import * as _ from 'lodash-es';
import Icon from '@iconify/svelte';
import UI from '../ui';
import { watch } from 'runed';
import { site_context } from '$lib/builder/stores/context';

export default function Link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { field, entry: passedEntry, onchange } = $$props;
		const default_value = { label: '', url: '', page: null };
		const default_entry = { value: default_value };
		const { value: site } = site_context.getOr({ value: null });
		const entry = $.derived(() => passedEntry || default_entry);
		const all_pages = $.derived(() => site?.pages() ?? []);

		// Build hierarchical page list with visual indicators for subpages
		const selectable_pages = $.derived(() => {
			if (!all_pages().length) return [];

			const homepage = site?.homepage();

			if (!homepage) return all_pages().sort((a, b) => a.index - b.index);

			const result = [];

			function add_descendants(page, depth = 0) {
				const arrows = depth > 0 ? ('↳ ').repeat(depth) : '';

				result.push({ ...page, label: `${arrows}${page.name}`, value: page.id });

				// Get and sort children
				const children = all_pages().filter((p) => p.parent === page.id).sort((a, b) => a.index - b.index);

				for (const child of children) {
					add_descendants(child, depth + 1);
				}
			}

			// Add homepage (no arrow)
			result.push({ ...homepage, label: homepage.name, value: homepage.id });

			// Get homepage's direct children (same level as homepage, no arrows)
			const top_level_children = all_pages().filter((p) => p.parent === homepage.id).sort((a, b) => a.index - b.index);

			// For each top-level child, add it and its descendants
			for (const child of top_level_children) {
				result.push({ ...child, label: child.name, value: child.id });

				// Add this child's descendants with arrows
				const grandchildren = all_pages().filter((p) => p.parent === child.id).sort((a, b) => a.index - b.index);

				for (const grandchild of grandchildren) {
					add_descendants(grandchild, 1);
				}
			}

			return result;
		});

		// Auto-select first page on open
		let auto_selected_page = false;

		watch(() => selectable_pages(), () => {
			const top_page = selectable_pages()[0];

			if (!top_page || auto_selected_page) return;

			const has_url = entry()?.value?.url;
			const has_page = entry()?.value?.page;

			if (!has_url && !has_page && selected() === 'page') {
				onchange({
					[field.key]: { 0: { value: { ...entry().value, page: top_page.id } } }
				});

				auto_selected_page = true;
			}
		});

		let selected = $.derived(() => entry()?.value?.url ? 'url' : 'page');

		$$renderer.push(`<div class="Link svelte-1izzlya"><div class="inputs svelte-1izzlya">`);

		if (UI.TextInput) {
			$$renderer.push('<!--[-->');

			UI.TextInput($$renderer, {
				label: field.label,
				oninput: (text) => {
					onchange({
						[field.key]: { 0: { value: { ...entry().value, label: text } } }
					});
				},
				value: entry()?.value?.label,
				id: 'page-label',
				placeholder: 'About Us'
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <div class="url-select svelte-1izzlya"><div class="toggle svelte-1izzlya"><button type="button"${$.attr_class('svelte-1izzlya', void 0, { 'active': selected() === 'page' })}>`);
		Icon($$renderer, { icon: 'iconoir:multiple-pages' });
		$$renderer.push(`<!----> <span>Page</span></button> <button type="button"${$.attr_class('svelte-1izzlya', void 0, { 'active': selected() === 'url' })}>`);
		Icon($$renderer, { icon: 'akar-icons:link-chain' });
		$$renderer.push(`<!----> <span>URL</span></button></div> `);

		if (selected() === 'page') {
			$$renderer.push('<!--[0-->');

			if (UI.Select) {
				$$renderer.push('<!--[-->');

				UI.Select($$renderer, {
					fullwidth: true,
					value: entry()?.value?.page,
					options: selectable_pages()
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');

			if (UI.TextInput) {
				$$renderer.push('<!--[-->');

				UI.TextInput($$renderer, {
					oninput: (text) => {
						onchange({
							[field.key]: {
								0: { value: { ...entry().value, url: text, page: undefined } }
							}
						});
					},

					onblur: () => {
						// auto-set https protocol only if no protocol exists and it's not a relative URL
						const text = entry()?.value?.url;

						if (!text) return;

						const has_protocol = text.includes('://');
						const is_relative = text.startsWith('/') || text.startsWith('#');

						if (!has_protocol && !is_relative) {
							const url_with_protocol = `https://${text}`;

							onchange({
								[field.key]: {
									0: {
										value: { ...entry().value, url: url_with_protocol, page: undefined }
									}
								}
							});
						}
					},
					value: entry()?.value?.url,
					type: 'url',
					placeholder: 'https://example.com'
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}