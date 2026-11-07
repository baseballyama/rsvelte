import * as $ from 'svelte/internal/server';
import FieldItem from './FieldItem.svelte';
import { tick } from 'svelte';
import { cloneDeep } from 'lodash-es';
import autosize from 'autosize';
import { mod_key_held } from '../../stores/app/misc';
import UI from '../../ui/index.js';
import Icon from '@iconify/svelte';
import Condition from './Condition.svelte';
import PageField from './PageField.svelte';
import SiteFieldField from './SiteFieldField.svelte';
import PageFieldField from './PageFieldField.svelte';
import PageListField from './PageListField.svelte';
import SelectField from './SelectField.svelte';
import ImageFieldOptions from './ImageFieldOptions.svelte';
import fieldTypes from '../../stores/app/fieldTypes.js';
import { dynamic_field_types } from '$lib/builder/field-types';

import {
	site_context,
	hide_dynamic_field_types_context,
	hide_page_field_field_type_context,
	hide_site_field_field_type_context
} from '$lib/builder/stores/context';

import pluralize from 'pluralize';

export default function FieldItem_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			field,
			fields,
			level = 0,
			top_level = true,
			create_field,
			onchange,
			onduplicate,
			ondelete,
			onmove
		} = $$props;

		const { value: site } = site_context.getOr({ value: null });
		const page_types = $.derived(() => site?.page_types() ?? []);

		// Workaround for derived being lazy:
		// Ensure page types list begins loading as soon as the editor renders,
		// so switching to Page/Page List has data available.
		// Accessing the link in an effect triggers the CollectionMapping list loader.
		// We intentionally ignore the return; we just want to kick off loading.
		let visible_field_types = $.derived(() => {
			let list = $.store_get($$store_subs ??= {}, '$fieldTypes', fieldTypes);

			if (hide_dynamic_field_types_context.getOr(false)) {
				list = list.filter((ft) => !dynamic_field_types.includes(ft.id));
			}

			if (hide_page_field_field_type_context.getOr(false)) {
				list = list.filter((ft) => ft.id !== 'page-field');
			}

			if (hide_site_field_field_type_context.getOr(false)) {
				list = list.filter((ft) => ft.id !== 'site-field');
			}

			return list;
		});

		let comparable_fields = $.derived(() => fields.filter((f) => {
			const is_valid_type = ['text', 'number', 'switch', 'url', 'select'].includes(f.type);
			const same_parent = !f.parent && !field.parent || f.parent === field.parent;
			const is_previous_sibling = same_parent && (f.index || 0) < (field.index || 0);

			return is_valid_type && is_previous_sibling;
		}).sort((a, b) => (a.index || 0) - (b.index || 0)));

		function validate_field_key(key) {
			// replace dash and space with underscore
			return key.replace(/-/g, '_').replace(/ /g, '_').toLowerCase();
		}

		function make_unique_label(base_label) {
			if (!base_label) return base_label;

			const base = String(base_label).trim();
			const siblings = fields.filter((f) => f.id !== field.id && (!f.parent && !field.parent || f.parent === field.parent)).map((f) => (f.label || '').trim().toLowerCase());
			let candidate = base;
			let i = 2;

			while (siblings.includes(candidate.trim().toLowerCase())) {
				candidate = `${base} ${i}`;
				i++;
			}

			return candidate;
		}

		// Auto-fill key when setting label (only for new fields without a key yet)
		let key_edited = field.key !== '';

		// autosize info textarea
		let info_textarea;

		let width = void 0;
		let collapsed = false;
		let minimal = $.derived(() => field.type === 'info');
		let has_subfields = $.derived(() => field.type === 'group' || field.type === 'repeater');
		let has_condition = $.derived(() => !!field.config?.condition);
		let show_condition_editor = !!field.config?.condition;

		// enable condition if field has previous siblings without their own condition
		let condition_enabled = $.derived(() => comparable_fields().length > 0);

		let selected_field_type_id = void 0;

		// auto-match field-type to entered label (enhanced pattern matching)
		let field_type_changed = false; // but don't overwrite it if the user's already entered it

		function update_field_type(label) {
			if (!label) return 'text';

			const labelLower = label.toLowerCase();

			// Only consider the key if the user explicitly edited it; otherwise it
			// can bias detection (e.g. label 'images' with auto-key 'image').
			const keyLower = key_edited ? field.key?.toLowerCase() || '' : '';

			const combined = `${labelLower} ${keyLower}`;

			// 1) Highly specific entity patterns first
			// Page patterns (detect lists before generic repeater)
			if ((/\b(page|pages)\b/).test(combined)) {
				// If label implies choosing a type of page, prefer a select
				if ((/\btype\b/).test(combined)) return 'select';

				const isList = (/\b(list|multiple|many)\b/).test(combined) || pluralize.isPlural(label);

				return isList ? 'page-list' : 'page';
			}

			// Site field patterns
			if ((/\b(site|global|config|setting)\b/).test(combined)) return 'site-field';

			// Page field patterns
			if ((/\b(page-field|page-content)\b/).test(combined)) return 'page-field';

			// 2) Plural/array heuristic early (after page/site/page-field)
			if (label && pluralize.isPlural(label)) {
				return 'repeater';
			}

			// URL/Link patterns
			if ((/\b(url|href|website|domain)\b/).test(combined)) return 'url';

			if ((/\b(link)\b/).test(combined)) return 'link';

			// Image patterns
			if ((/\b(image|img|photo|picture|avatar|banner|logo)\b/).test(combined)) return 'image';

			// Icon patterns
			if ((/\b(icon|emoji)\b/).test(combined)) return 'icon';

			// Date patterns
			if ((/\b(date|day|time|when|schedule|deadline|birthday|anniversary|created|updated|published|expired)\b/).test(combined)) return 'date';

			// Number patterns
			if ((/\b(number|num|count|quantity|amount|price|cost|age|weight|height|width)\b/).test(combined)) return 'number';

			// Slider patterns (ranges, ratings, percentages)
			if ((/\b(rating|range|percent|score|level|opacity|volume)\b/).test(combined)) return 'slider';

			// Boolean/Toggle patterns
			if ((/\b(is|has|show|hide|enable|disable|active|visible|featured|toggle)\b/).test(combined)) return 'switch';

			// Select/Choice patterns
			if ((/\b(type|category|status|state|option|choice|select)\b/).test(combined)) return 'select';

			// Group patterns (sections, groups)
			if ((/\b(group|section|block|area)\b/).test(combined)) return 'group';

			// Markdown patterns
			if ((/\b(markdown|md|rich|formatted|wysiwyg|content|body|description|bio|about|summary|details)\b/).test(combined)) {
				return (/\b(markdown|md)\b/).test(combined) ? 'markdown' : 'rich-text';
			}

			// Default to text
			return 'text';
		}

		function add_condition() {
			const default_field_id = comparable_fields()[0]?.id ?? null;

			const next = {
				...field.config || {},
				condition: { field: default_field_id, comparison: '=', value: '' }
			};

			onchange({ id: field.id, data: { config: next } });
			show_condition_editor = true;
		}

		const child_fields = $.derived(() => fields?.filter((f) => f.parent === field.id) || []);
		let is_new_field = field.key === '';
		let should_autofocus = field.key === '';
		let label_input = void 0;

		// Focus the label input for new fields
		let hide_footer = $.derived(() => !['select', 'image', ...dynamic_field_types].includes(field.type) && !field.config?.condition && !show_condition_editor);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class('top-container svelte-1v2427j', void 0, { 'top_level': top_level, 'collapsed': collapsed })}><div${$.attr_class('field-container svelte-1v2427j', void 0, { 'minimal': minimal() })}><div class="type column-container svelte-1v2427j">`);

			if (UI.Select) {
				$$renderer.push('<!--[-->');

				UI.Select($$renderer, {
					label: 'Type',
					value: selected_field_type_id,
					options: visible_field_types().map((ft) => ({ icon: ft.icon, value: ft.id, label: ft.label })),
					dividers: (() => {
						return hide_dynamic_field_types_context.getOr(false)
							? [1, 8]
							: hide_page_field_field_type_context.getOr(false) ? [1, 8, 9, 11] : [1, 8, 10, 12];
					})(),
					placement: 'bottom-start'
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (collapsed) {
				$$renderer.push(`<!--[0--><div class="field-options svelte-1v2427j">`);

				if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)) {
					$$renderer.push(`<!--[0--><div class="overlay-actions svelte-1v2427j"><button${$.attr('disabled', !condition_enabled(), true)} class="svelte-1v2427j">`);
					Icon($$renderer, { icon: 'mdi:show' });
					$$renderer.push(`<!----></button> <button class="svelte-1v2427j">`);
					Icon($$renderer, { icon: 'bxs:duplicate' });
					$$renderer.push(`<!----></button> <button class="delete svelte-1v2427j">`);
					Icon($$renderer, { icon: 'ic:outline-delete' });
					$$renderer.push(`<!----></button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');

					if (UI.Dropdown) {
						$$renderer.push('<!--[-->');

						UI.Dropdown($$renderer, {
							size: 'lg',
							options: [
								{
									label: 'Move up',
									icon: 'material-symbols:arrow-circle-up-outline',
									on_click: () => onmove(field.id, 'up')
								},

								{
									label: 'Move down',
									icon: 'material-symbols:arrow-circle-down-outline',
									on_click: () => onmove(field.id, 'down')
								},

								...has_condition()
									? []
									: [
										{
											label: 'Set condition',
											icon: 'mdi:hide',
											disabled: !condition_enabled(),
											on_click: add_condition
										}
									],

								{
									label: 'Duplicate',
									icon: 'bxs:duplicate',
									on_click: () => onduplicate(field.id)
								},

								{
									label: 'Delete',
									icon: 'ic:outline-delete',
									is_danger: true,
									on_click: () => ondelete(field)
								}
							],
							placement: 'bottom-end'
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (minimal()) {
				$$renderer.push(`<!--[0--><div class="main column-container svelte-1v2427j">`);

				if (UI.TextInput) {
					$$renderer.push('<!--[-->');

					UI.TextInput($$renderer, {
						label: 'Information',
						value: field.config?.info || '',
						grow: true,
						placeholder: 'Something important about the following fields...',
						oninput: (text) => {
							onchange({
								id: field.id,
								data: { config: { ...field.config, info: text } }
							});
						}
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (!collapsed) {
					$$renderer.push(`<!--[0--><div class="field-options svelte-1v2427j">`);

					if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)) {
						$$renderer.push(`<!--[0--><div class="overlay-actions svelte-1v2427j"><button${$.attr('disabled', !condition_enabled(), true)} class="svelte-1v2427j">`);
						Icon($$renderer, { icon: 'mdi:show' });
						$$renderer.push(`<!----></button> <button class="svelte-1v2427j">`);
						Icon($$renderer, { icon: 'bxs:duplicate' });
						$$renderer.push(`<!----></button> <button class="delete svelte-1v2427j">`);
						Icon($$renderer, { icon: 'ic:outline-delete' });
						$$renderer.push(`<!----></button></div>`);
					} else {
						$$renderer.push('<!--[-1-->');

						if (UI.Dropdown) {
							$$renderer.push('<!--[-->');

							UI.Dropdown($$renderer, {
								size: 'lg',
								options: [
									{
										label: 'Move up',
										icon: 'material-symbols:arrow-circle-up-outline',
										on_click: () => onmove(field.id, 'up')
									},

									{
										label: 'Move down',
										icon: 'material-symbols:arrow-circle-down-outline',
										on_click: () => onmove(field.id, 'down')
									},

									...has_condition()
										? []
										: [
											{
												label: 'Add Condition',
												icon: 'mdi:show',
												disabled: !condition_enabled(),
												on_click: add_condition
											}
										],

									{
										label: 'Duplicate',
										icon: 'bxs:duplicate',
										on_click: () => onduplicate(field.id)
									},

									{
										label: 'Delete',
										icon: 'ic:outline-delete',
										is_danger: true,
										on_click: () => ondelete(field)
									}
								],
								placement: 'bottom-end'
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="column-container svelte-1v2427j">`);

				if (UI.TextInput) {
					$$renderer.push('<!--[-->');

					UI.TextInput($$renderer, {
						label: 'Label',
						value: field.label,
						placeholder: 'Heading',
						oninput: (text) => {
							// Auto-generate key unless user has manually edited it
							let nextType = field.type;

							let nextConfig = field.config ?? null;

							// Only auto-suggest for truly new fields (no key yet)
							// and when the user hasn't explicitly changed type yet.
							// Allow re-evaluating as the user keeps typing.
							if (is_new_field && !field_type_changed) {
								const suggested = update_field_type(text);
								const is_suggested_visible = visible_field_types().some((ft) => ft.id === suggested);

								// Ignore suggestions that are not visible in this context (e.g. site-field in Site editor)
								if (suggested && suggested !== field.type && is_suggested_visible) {
									nextType = suggested;

									// Provide default config for specific types
									if (suggested === 'page' || suggested === 'page-list') {
										const firstPageType = page_types()[0]?.id || '';

										if (firstPageType) {
											nextConfig = { page_type: firstPageType };
										} else {
											// If no page types available, cancel switching to invalid type
											nextType = 'text';

											nextConfig = null;
										}
									} else {
										nextConfig = null;
									}

									// Immediately reflect the auto-selected type in the UI select
									selected_field_type_id = nextType;

									// config updates handled via onchange
								}
							}

							onchange({
								id: field.id,
								data: {
									label: text,
									key: key_edited ? field.key : validate_field_key(text),
									type: nextType,
									config: nextConfig
								}
							});

							// Stop focusing after first keystroke but keep new-field behavior
							if (text.length > 0) {
								should_autofocus = false;
							}
						},

						get element() {
							return label_input;
						},

						set element($$value) {
							label_input = $$value;
							$$settled = false;
						}
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div> <div class="column-container svelte-1v2427j">`);

				if (UI.TextInput) {
					$$renderer.push('<!--[-->');

					UI.TextInput($$renderer, {
						label: 'Key',
						placeholder: 'heading',
						value: field.key,
						oninput: (text) => {
							key_edited = true;
							is_new_field = false;
							onchange({ id: field.id, data: { key: validate_field_key(text) } });
						}
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (!collapsed) {
					$$renderer.push(`<!--[0--><div class="field-options svelte-1v2427j">`);

					if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)) {
						$$renderer.push(`<!--[0--><div class="overlay-actions svelte-1v2427j"><button${$.attr('disabled', !condition_enabled(), true)} class="svelte-1v2427j">`);
						Icon($$renderer, { icon: 'mdi:show' });
						$$renderer.push(`<!----></button> <button class="svelte-1v2427j">`);
						Icon($$renderer, { icon: 'bxs:duplicate' });
						$$renderer.push(`<!----></button> <button class="delete svelte-1v2427j">`);
						Icon($$renderer, { icon: 'ic:outline-delete' });
						$$renderer.push(`<!----></button></div>`);
					} else {
						$$renderer.push('<!--[-1-->');

						if (UI.Dropdown) {
							$$renderer.push('<!--[-->');

							UI.Dropdown($$renderer, {
								size: 'lg',
								options: [
									{
										label: 'Move up',
										icon: 'material-symbols:arrow-circle-up-outline',
										on_click: () => onmove(field.id, 'up')
									},

									{
										label: 'Move down',
										icon: 'material-symbols:arrow-circle-down-outline',
										on_click: () => onmove(field.id, 'down')
									},

									...has_condition()
										? []
										: [
											{
												label: 'Add Condition',
												icon: 'mdi:show',
												disabled: !condition_enabled(),
												on_click: add_condition
											}
										],

									{
										label: 'Duplicate',
										icon: 'bxs:duplicate',
										on_click: () => onduplicate(field.id)
									},

									{
										label: 'Delete',
										icon: 'ic:outline-delete',
										is_danger: true,
										on_click: () => ondelete(field)
									}
								],
								placement: 'bottom-end'
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div> <div${$.attr_class('footer svelte-1v2427j', void 0, { 'hidden': hide_footer() })}>`);

			if (field.type === 'select') {
				$$renderer.push('<!--[0-->');
				SelectField($$renderer, { field });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (field.type === 'image') {
				$$renderer.push('<!--[0-->');
				ImageFieldOptions($$renderer, { field });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (field.type === 'page-field') {
				$$renderer.push('<!--[0-->');
				PageFieldField($$renderer, { field });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (field.type === 'site-field') {
				$$renderer.push('<!--[0-->');
				SiteFieldField($$renderer, { field });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (field.type === 'page') {
				$$renderer.push('<!--[0-->');
				PageField($$renderer, { field });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (field.type === 'page-list') {
				$$renderer.push('<!--[0-->');
				PageListField($$renderer, { field });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (show_condition_editor) {
				$$renderer.push('<!--[0-->');

				Condition($$renderer, {
					field,
					field_to_compare: fields.find((f) => f.id === field.config?.condition?.field),
					comparable_fields: comparable_fields(),
					collapsed
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (has_subfields()) {
				$$renderer.push(`<!--[0--><div class="children-container svelte-1v2427j"${$.attr_style('', { 'padding-left': `${$.stringify(level + 1)}rem` })}><!--[-->`);

				const each_array = $.ensure_array_like(child_fields().sort((a, b) => a.index - b.index));

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let subfield = each_array[$$index];

					FieldItem($$renderer, {
						field: cloneDeep(subfield),
						fields,
						create_field,
						top_level: false,
						level: level + 1,
						onduplicate,
						ondelete,
						onmove,
						onchange
					});
				}

				$$renderer.push(`<!--]--> `);

				if (field.type === 'repeater' || field.type === 'group') {
					$$renderer.push(`<!--[0--><button class="subfield-button svelte-1v2427j"${$.attr('data-level', level)}>`);
					Icon($$renderer, { icon: 'fa-solid:plus' });
					$$renderer.push(`<!----> <span>Create ${$.escape(field.label)} Subfield</span></button>`);
				} else {
					$$renderer.push('<!--[-1-->');
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}