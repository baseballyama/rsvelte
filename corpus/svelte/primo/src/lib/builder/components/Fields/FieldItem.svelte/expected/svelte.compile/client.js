import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="overlay-actions svelte-1v2427j"><button class="svelte-1v2427j"><!></button> <button class="svelte-1v2427j"><!></button> <button class="delete svelte-1v2427j"><!></button></div>`);
var root_1 = $.from_html(`<div class="field-options svelte-1v2427j"><!></div>`);
var root_2 = $.from_html(`<div class="main column-container svelte-1v2427j"><!> <!></div>`);
var root_3 = $.from_html(`<div class="column-container svelte-1v2427j"><!></div> <div class="column-container svelte-1v2427j"><!> <!></div>`, 1);
var root_4 = $.from_html(`<button class="subfield-button svelte-1v2427j"><!> <span> </span></button>`);
var root_5 = $.from_html(`<div class="children-container svelte-1v2427j"><!> <!></div>`);
var root_6 = $.from_html(`<div><div><div class="type column-container svelte-1v2427j"><!> <!></div> <!></div> <div><!> <!> <!> <!> <!> <!> <!></div> <!></div>`);

export default function FieldItem_1($$anchor, $$props) {
	$.push($$props, true);

	const $fieldTypes = () => $.store_get(fieldTypes, '$fieldTypes', $$stores);
	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let level = $.prop($$props, 'level', 3, 0),
		top_level = $.prop($$props, 'top_level', 3, true);

	const { value: site } = site_context.getOr({ value: null });
	const page_types = $.derived(() => site?.page_types() ?? []);

	// Workaround for derived being lazy:
	// Ensure page types list begins loading as soon as the editor renders,
	// so switching to Page/Page List has data available.
	$.user_effect(() => {
		// Accessing the link in an effect triggers the CollectionMapping list loader.
		// We intentionally ignore the return; we just want to kick off loading.
		site?.page_types();
	});

	let visible_field_types = $.derived(() => {
		let list = $fieldTypes();

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

	let comparable_fields = $.derived(() => $$props.fields.filter((f) => {
		const is_valid_type = ['text', 'number', 'switch', 'url', 'select'].includes(f.type);
		const same_parent = !f.parent && !$$props.field.parent || f.parent === $$props.field.parent;
		const is_previous_sibling = same_parent && (f.index || 0) < ($$props.field.index || 0);

		return is_valid_type && is_previous_sibling;
	}).sort((a, b) => (a.index || 0) - (b.index || 0)));

	function validate_field_key(key) {
		// replace dash and space with underscore
		return key.replace(/-/g, '_').replace(/ /g, '_').toLowerCase();
	}

	function make_unique_label(base_label) {
		if (!base_label) return base_label;

		const base = String(base_label).trim();
		const siblings = $$props.fields.filter((f) => f.id !== $$props.field.id && (!f.parent && !$$props.field.parent || f.parent === $$props.field.parent)).map((f) => (f.label || '').trim().toLowerCase());
		let candidate = base;
		let i = 2;

		while (siblings.includes(candidate.trim().toLowerCase())) {
			candidate = `${base} ${i}`;
			i++;
		}

		return candidate;
	}

	// Auto-fill key when setting label (only for new fields without a key yet)
	let key_edited = $.state($$props.field.key !== '');

	// autosize info textarea
	let info_textarea;

	$.user_effect(() => {
		if (info_textarea) {
			autosize(info_textarea);
		}
	});

	let width = $.state(void 0);
	let collapsed = $.state(false);

	$.user_effect(() => {
		if (!$.get(width)) {
			return;
		} else if ($.get(width) < 400 && !$.get(collapsed)) {
			$.set(collapsed, true);
		} else if ($.get(width) > 500 && $.get(collapsed)) {
			$.set(collapsed, false);
		}
	});

	let minimal = $.derived(() => $$props.field.type === 'info');
	let has_subfields = $.derived(() => $$props.field.type === 'group' || $$props.field.type === 'repeater');
	let has_condition = $.derived(() => !!$$props.field.config?.condition);
	let show_condition_editor = $.state(!!$$props.field.config?.condition);

	$.user_effect(() => {
		$.set(show_condition_editor, !!$$props.field.config?.condition);
	});

	// enable condition if field has previous siblings without their own condition
	let condition_enabled = $.derived(() => $.get(comparable_fields).length > 0);

	let selected_field_type_id = $.state(void 0);

	$.user_pre_effect(() => {
		$.set(selected_field_type_id, $.get(visible_field_types).find((ft) => ft.id === $$props.field.type)?.id, true);
	});

	// auto-match field-type to entered label (enhanced pattern matching)
	let field_type_changed = $.state(false // but don't overwrite it if the user's already entered it
	);

	function update_field_type(label) {
		if (!label) return 'text';

		const labelLower = label.toLowerCase();

		// Only consider the key if the user explicitly edited it; otherwise it
		// can bias detection (e.g. label 'images' with auto-key 'image').
		const keyLower = $.get(key_edited) ? $$props.field.key?.toLowerCase() || '' : '';

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
		const default_field_id = $.get(comparable_fields)[0]?.id ?? null;

		const next = {
			...$$props.field.config || {},
			condition: { field: default_field_id, comparison: '=', value: '' }
		};

		$$props.onchange({ id: $$props.field.id, data: { config: next } });
		$.set(show_condition_editor, true);
	}

	const child_fields = $.derived(() => $$props.fields?.filter((f) => f.parent === $$props.field.id) || []);
	let is_new_field = $.state($$props.field.key === '');
	let should_autofocus = $.state($$props.field.key === '');
	let label_input = $.state(void 0);

	// Focus the label input for new fields
	$.user_effect(() => {
		if ($.get(should_autofocus) && $.get(label_input)) {
			tick().then(() => {
				$.get(label_input).focus();
			});
		}
	});

	let hide_footer = $.derived(() => !['select', 'image', ...dynamic_field_types].includes($$props.field.type) && !$$props.field.config?.condition && !$.get(show_condition_editor));
	var div = root_6();
	let classes;
	var div_1 = $.child(div);
	let classes_1;
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		let $0 = $.derived(() => $.get(visible_field_types).map((ft) => ({ icon: ft.icon, value: ft.id, label: ft.label })));

		let $1 = $.derived(() => (() => {
			return hide_dynamic_field_types_context.getOr(false)
				? [1, 8]
				: hide_page_field_field_type_context.getOr(false) ? [1, 8, 9, 11] : [1, 8, 10, 12];
		})());

		$.component(node, () => UI.Select, ($$anchor, UI_Select) => {
			UI_Select($$anchor, {
				label: 'Type',
				get value() {
					return $.get(selected_field_type_id);
				},

				get options() {
					return $.get($0);
				},

				get dividers() {
					return $.get($1);
				},
				placement: 'bottom-start',
				$$events: {
					input: ({ detail: field_type_id }) => {
						$.set(field_type_changed, true);
						$.set(is_new_field, false);
						$.set(selected_field_type_id, field_type_id, true);

						// Set default config based on field type
						let defaultConfig = {};

						if (field_type_id === 'page') {
							// Page field requires page_type - get the first available page type
							const firstPageType = $.get(page_types)[0]?.id || '';

							defaultConfig = { page_type: firstPageType };
						} else if (field_type_id === 'page-list') {
							// Page list might also need page_type
							const firstPageType = $.get(page_types)[0]?.id || '';

							defaultConfig = { page_type: firstPageType };
						} else {
							defaultConfig = null;
						}

						// config updates handled via onchange
						// Optionally auto-fill label (and key) if label is empty & not reference field type (since they autofill the label/key themselves)
						let data = { type: field_type_id, config: defaultConfig };

						const has_label = !!($$props.field.label && $$props.field.label.trim().length > 0);

						if (!has_label && !['page-field', 'site-field'].includes(field_type_id)) {
							const ft = $.get(visible_field_types).find((ft) => ft.id === field_type_id);
							let suggested_label = ft?.label || field_type_id.charAt(0).toUpperCase() + field_type_id.slice(1).replace(/-/g, ' ');

							suggested_label = make_unique_label(suggested_label);
							data.label = suggested_label;

							if (!$.get(key_edited) && (!$$props.field.key || $$props.field.key.trim() === '')) {
								data.key = validate_field_key(suggested_label);
							}
						}

						$$props.onchange({ id: $$props.field.id, data });
					}
				}
			});
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_3 = root_1();
			var node_2 = $.child(div_3);

			{
				var consequent = ($$anchor) => {
					var div_4 = root();
					var button = $.child(div_4);
					var node_3 = $.child(button);

					Icon(node_3, { icon: 'mdi:show' });
					$.reset(button);

					var button_1 = $.sibling(button, 2);
					var node_4 = $.child(button_1);

					Icon(node_4, { icon: 'bxs:duplicate' });
					$.reset(button_1);

					var button_2 = $.sibling(button_1, 2);
					var node_5 = $.child(button_2);

					Icon(node_5, { icon: 'ic:outline-delete' });
					$.reset(button_2);
					$.reset(div_4);
					$.template_effect(() => button.disabled = !$.get(condition_enabled));
					$.delegated('click', button, add_condition);
					$.delegated('click', button_1, () => $$props.onduplicate($$props.field.id));
					$.delegated('click', button_2, () => $$props.ondelete($$props.field));
					$.append($$anchor, div_4);
				};

				var alternate = ($$anchor) => {
					var fragment = $.comment();
					var node_6 = $.first_child(fragment);

					{
						let $0 = $.derived(() => [
							{
								label: 'Move up',
								icon: 'material-symbols:arrow-circle-up-outline',
								on_click: () => $$props.onmove($$props.field.id, 'up')
							},

							{
								label: 'Move down',
								icon: 'material-symbols:arrow-circle-down-outline',
								on_click: () => $$props.onmove($$props.field.id, 'down')
							},

							...$.get(has_condition)
								? []
								: [
									{
										label: 'Set condition',
										icon: 'mdi:hide',
										disabled: !$.get(condition_enabled),
										on_click: add_condition
									}
								],

							{
								label: 'Duplicate',
								icon: 'bxs:duplicate',
								on_click: () => $$props.onduplicate($$props.field.id)
							},

							{
								label: 'Delete',
								icon: 'ic:outline-delete',
								is_danger: true,
								on_click: () => $$props.ondelete($$props.field)
							}
						]);

						$.component(node_6, () => UI.Dropdown, ($$anchor, UI_Dropdown) => {
							UI_Dropdown($$anchor, {
								size: 'lg',
								get options() {
									return $.get($0);
								},
								placement: 'bottom-end'
							});
						});
					}

					$.append($$anchor, fragment);
				};

				$.if(node_2, ($$render) => {
					if ($mod_key_held()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if ($.get(collapsed)) $$render(consequent_1);
		});
	}

	$.reset(div_2);

	var node_7 = $.sibling(div_2, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_5 = root_2();
			var node_8 = $.child(div_5);

			{
				let $0 = $.derived(() => $$props.field.config?.info || '');

				$.component(node_8, () => UI.TextInput, ($$anchor, UI_TextInput) => {
					UI_TextInput($$anchor, {
						label: 'Information',
						get value() {
							return $.get($0);
						},
						grow: true,
						placeholder: 'Something important about the following fields...',
						oninput: (text) => {
							$$props.onchange({
								id: $$props.field.id,
								data: { config: { ...$$props.field.config, info: text } }
							});
						}
					});
				});
			}

			var node_9 = $.sibling(node_8, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_6 = root_1();
					var node_10 = $.child(div_6);

					{
						var consequent_2 = ($$anchor) => {
							var div_7 = root();
							var button_3 = $.child(div_7);
							var node_11 = $.child(button_3);

							Icon(node_11, { icon: 'mdi:show' });
							$.reset(button_3);

							var button_4 = $.sibling(button_3, 2);
							var node_12 = $.child(button_4);

							Icon(node_12, { icon: 'bxs:duplicate' });
							$.reset(button_4);

							var button_5 = $.sibling(button_4, 2);
							var node_13 = $.child(button_5);

							Icon(node_13, { icon: 'ic:outline-delete' });
							$.reset(button_5);
							$.reset(div_7);
							$.template_effect(() => button_3.disabled = !$.get(condition_enabled));
							$.delegated('click', button_3, add_condition);
							$.delegated('click', button_4, () => $$props.onduplicate($$props.field.id));
							$.delegated('click', button_5, () => $$props.ondelete($$props.field));
							$.append($$anchor, div_7);
						};

						var alternate_1 = ($$anchor) => {
							var fragment_1 = $.comment();
							var node_14 = $.first_child(fragment_1);

							{
								let $0 = $.derived(() => [
									{
										label: 'Move up',
										icon: 'material-symbols:arrow-circle-up-outline',
										on_click: () => $$props.onmove($$props.field.id, 'up')
									},

									{
										label: 'Move down',
										icon: 'material-symbols:arrow-circle-down-outline',
										on_click: () => $$props.onmove($$props.field.id, 'down')
									},

									...$.get(has_condition)
										? []
										: [
											{
												label: 'Add Condition',
												icon: 'mdi:show',
												disabled: !$.get(condition_enabled),
												on_click: add_condition
											}
										],

									{
										label: 'Duplicate',
										icon: 'bxs:duplicate',
										on_click: () => $$props.onduplicate($$props.field.id)
									},

									{
										label: 'Delete',
										icon: 'ic:outline-delete',
										is_danger: true,
										on_click: () => $$props.ondelete($$props.field)
									}
								]);

								$.component(node_14, () => UI.Dropdown, ($$anchor, UI_Dropdown_1) => {
									UI_Dropdown_1($$anchor, {
										size: 'lg',
										get options() {
											return $.get($0);
										},
										placement: 'bottom-end'
									});
								});
							}

							$.append($$anchor, fragment_1);
						};

						$.if(node_10, ($$render) => {
							if ($mod_key_held()) $$render(consequent_2); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				$.if(node_9, ($$render) => {
					if (!$.get(collapsed)) $$render(consequent_3);
				});
			}

			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		var alternate_3 = ($$anchor) => {
			var fragment_2 = root_3();
			var div_8 = $.first_child(fragment_2);
			var node_15 = $.child(div_8);

			$.component(node_15, () => UI.TextInput, ($$anchor, UI_TextInput_1) => {
				UI_TextInput_1($$anchor, {
					label: 'Label',
					get value() {
						return $$props.field.label;
					},
					placeholder: 'Heading',
					oninput: (text) => {
						// Auto-generate key unless user has manually edited it
						let nextType = $$props.field.type;

						let nextConfig = $$props.field.config ?? null;

						// Only auto-suggest for truly new fields (no key yet)
						// and when the user hasn't explicitly changed type yet.
						// Allow re-evaluating as the user keeps typing.
						if ($.get(is_new_field) && !$.get(field_type_changed)) {
							const suggested = update_field_type(text);
							const is_suggested_visible = $.get(visible_field_types).some((ft) => ft.id === suggested);

							// Ignore suggestions that are not visible in this context (e.g. site-field in Site editor)
							if (suggested && suggested !== $$props.field.type && is_suggested_visible) {
								nextType = suggested;

								// Provide default config for specific types
								if (suggested === 'page' || suggested === 'page-list') {
									const firstPageType = $.get(page_types)[0]?.id || '';

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
								$.set(selected_field_type_id, nextType, true);

								// config updates handled via onchange
							}
						}

						$$props.onchange({
							id: $$props.field.id,
							data: {
								label: text,
								key: $.get(key_edited) ? $$props.field.key : validate_field_key(text),
								type: nextType,
								config: nextConfig
							}
						});

						// Stop focusing after first keystroke but keep new-field behavior
						if (text.length > 0) {
							$.set(should_autofocus, false);
						}
					},

					get element() {
						return $.get(label_input);
					},

					set element($$value) {
						$.set(label_input, $$value, true);
					},

					$$events: {
						keydown: function ($$arg) {
							$.bubble_event.call(this, $$props, $$arg);
						}
					}
				});
			});

			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var node_16 = $.child(div_9);

			$.component(node_16, () => UI.TextInput, ($$anchor, UI_TextInput_2) => {
				UI_TextInput_2($$anchor, {
					label: 'Key',
					placeholder: 'heading',
					get value() {
						return $$props.field.key;
					},

					oninput: (text) => {
						$.set(key_edited, true);
						$.set(is_new_field, false);

						$$props.onchange({
							id: $$props.field.id,
							data: { key: validate_field_key(text) }
						});
					},

					$$events: {
						keydown: function ($$arg) {
							$.bubble_event.call(this, $$props, $$arg);
						}
					}
				});
			});

			var node_17 = $.sibling(node_16, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_10 = root_1();
					var node_18 = $.child(div_10);

					{
						var consequent_5 = ($$anchor) => {
							var div_11 = root();
							var button_6 = $.child(div_11);
							var node_19 = $.child(button_6);

							Icon(node_19, { icon: 'mdi:show' });
							$.reset(button_6);

							var button_7 = $.sibling(button_6, 2);
							var node_20 = $.child(button_7);

							Icon(node_20, { icon: 'bxs:duplicate' });
							$.reset(button_7);

							var button_8 = $.sibling(button_7, 2);
							var node_21 = $.child(button_8);

							Icon(node_21, { icon: 'ic:outline-delete' });
							$.reset(button_8);
							$.reset(div_11);
							$.template_effect(() => button_6.disabled = !$.get(condition_enabled));
							$.delegated('click', button_6, add_condition);
							$.delegated('click', button_7, () => $$props.onduplicate($$props.field.id));
							$.delegated('click', button_8, () => $$props.ondelete($$props.field));
							$.append($$anchor, div_11);
						};

						var alternate_2 = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_22 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => [
									{
										label: 'Move up',
										icon: 'material-symbols:arrow-circle-up-outline',
										on_click: () => $$props.onmove($$props.field.id, 'up')
									},

									{
										label: 'Move down',
										icon: 'material-symbols:arrow-circle-down-outline',
										on_click: () => $$props.onmove($$props.field.id, 'down')
									},

									...$.get(has_condition)
										? []
										: [
											{
												label: 'Add Condition',
												icon: 'mdi:show',
												disabled: !$.get(condition_enabled),
												on_click: add_condition
											}
										],

									{
										label: 'Duplicate',
										icon: 'bxs:duplicate',
										on_click: () => $$props.onduplicate($$props.field.id)
									},

									{
										label: 'Delete',
										icon: 'ic:outline-delete',
										is_danger: true,
										on_click: () => $$props.ondelete($$props.field)
									}
								]);

								$.component(node_22, () => UI.Dropdown, ($$anchor, UI_Dropdown_2) => {
									UI_Dropdown_2($$anchor, {
										size: 'lg',
										get options() {
											return $.get($0);
										},
										placement: 'bottom-end'
									});
								});
							}

							$.append($$anchor, fragment_3);
						};

						$.if(node_18, ($$render) => {
							if ($mod_key_held()) $$render(consequent_5); else $$render(alternate_2, -1);
						});
					}

					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				$.if(node_17, ($$render) => {
					if (!$.get(collapsed)) $$render(consequent_6);
				});
			}

			$.reset(div_9);
			$.append($$anchor, fragment_2);
		};

		$.if(node_7, ($$render) => {
			if ($.get(minimal)) $$render(consequent_4); else $$render(alternate_3, -1);
		});
	}

	$.reset(div_1);

	var div_12 = $.sibling(div_1, 2);
	let classes_2;
	var node_23 = $.child(div_12);

	{
		var consequent_7 = ($$anchor) => {
			SelectField($$anchor, {
				get field() {
					return $$props.field;
				},

				$$events: {
					input: (event) => {
						$$props.onchange({ id: $$props.field.id, data: event.detail });
					}
				}
			});
		};

		$.if(node_23, ($$render) => {
			if ($$props.field.type === 'select') $$render(consequent_7);
		});
	}

	var node_24 = $.sibling(node_23, 2);

	{
		var consequent_8 = ($$anchor) => {
			ImageFieldOptions($$anchor, {
				get field() {
					return $$props.field;
				},

				$$events: {
					input: ({ detail }) => {
						const next = { ...$$props.field.config || {}, ...detail?.config || {} };

						$$props.onchange({ id: $$props.field.id, data: { config: next } });
					}
				}
			});
		};

		$.if(node_24, ($$render) => {
			if ($$props.field.type === 'image') $$render(consequent_8);
		});
	}

	var node_25 = $.sibling(node_24, 2);

	{
		var consequent_9 = ($$anchor) => {
			PageFieldField($$anchor, {
				get field() {
					return $$props.field;
				},

				$$events: {
					input: (event) => {
						$$props.onchange({ id: $$props.field.id, data: event.detail });
					}
				}
			});
		};

		$.if(node_25, ($$render) => {
			if ($$props.field.type === 'page-field') $$render(consequent_9);
		});
	}

	var node_26 = $.sibling(node_25, 2);

	{
		var consequent_10 = ($$anchor) => {
			SiteFieldField($$anchor, {
				get field() {
					return $$props.field;
				},

				$$events: {
					input: (event) => {
						$$props.onchange({ id: $$props.field.id, data: event.detail });
					}
				}
			});
		};

		$.if(node_26, ($$render) => {
			if ($$props.field.type === 'site-field') $$render(consequent_10);
		});
	}

	var node_27 = $.sibling(node_26, 2);

	{
		var consequent_11 = ($$anchor) => {
			PageField($$anchor, {
				get field() {
					return $$props.field;
				},

				$$events: {
					input: (event) => {
						$$props.onchange({ id: $$props.field.id, data: event.detail });
					}
				}
			});
		};

		$.if(node_27, ($$render) => {
			if ($$props.field.type === 'page') $$render(consequent_11);
		});
	}

	var node_28 = $.sibling(node_27, 2);

	{
		var consequent_12 = ($$anchor) => {
			PageListField($$anchor, {
				get field() {
					return $$props.field;
				},

				$$events: {
					input: (event) => {
						$$props.onchange({ id: $$props.field.id, data: event.detail });
					}
				}
			});
		};

		$.if(node_28, ($$render) => {
			if ($$props.field.type === 'page-list') $$render(consequent_12);
		});
	}

	var node_29 = $.sibling(node_28, 2);

	{
		var consequent_13 = ($$anchor) => {
			{
				let $0 = $.derived(() => $$props.fields.find((f) => f.id === $$props.field.config?.condition?.field));

				Condition($$anchor, {
					get field() {
						return $$props.field;
					},

					get field_to_compare() {
						return $.get($0);
					},

					get comparable_fields() {
						return $.get(comparable_fields);
					},

					get collapsed() {
						return $.get(collapsed);
					},

					$$events: {
						input: ({ detail: condition }) => {
							const next = { ...$$props.field.config || {}, condition };

							$$props.onchange({ id: $$props.field.id, data: { config: next } });
						}
					}
				});
			}
		};

		$.if(node_29, ($$render) => {
			if ($.get(show_condition_editor)) $$render(consequent_13);
		});
	}

	$.reset(div_12);

	var node_30 = $.sibling(div_12, 2);

	{
		var consequent_15 = ($$anchor) => {
			var div_13 = root_5();
			let styles;
			var node_31 = $.child(div_13);

			$.each(node_31, 17, () => $.get(child_fields).sort((a, b) => a.index - b.index), (subfield) => subfield.id, ($$anchor, subfield) => {
				{
					let $0 = $.derived(() => cloneDeep($.get(subfield)));
					let $1 = $.derived(() => level() + 1);

					FieldItem($$anchor, {
						get field() {
							return $.get($0);
						},

						get fields() {
							return $$props.fields;
						},

						get create_field() {
							return $$props.create_field;
						},
						top_level: false,
						get level() {
							return $.get($1);
						},

						get onduplicate() {
							return $$props.onduplicate;
						},

						get ondelete() {
							return $$props.ondelete;
						},

						get onmove() {
							return $$props.onmove;
						},

						get onchange() {
							return $$props.onchange;
						}
					});
				}
			});

			var node_32 = $.sibling(node_31, 2);

			{
				var consequent_14 = ($$anchor) => {
					var button_9 = root_4();
					var node_33 = $.child(button_9);

					Icon(node_33, { icon: 'fa-solid:plus' });

					var span = $.sibling(node_33, 2);
					var text_1 = $.only_child(span);

					$.reset(button_9);

					$.template_effect(() => {
						$.set_attribute(button_9, 'data-level', level());
						$.set_text(text_1, `Create ${$$props.field.label ?? ''} Subfield`);
					});

					$.delegated('click', button_9, () => {
						if ($$props.create_field) {
							$$props.create_field({ parent: $$props.field.id });
						}
					});

					$.append($$anchor, button_9);
				};

				$.if(node_32, ($$render) => {
					if ($$props.field.type === 'repeater' || $$props.field.type === 'group') $$render(consequent_14);
				});
			}

			$.reset(div_13);
			$.template_effect(() => styles = $.set_style(div_13, '', styles, { 'padding-left': `${level() + 1}rem` }));
			$.append($$anchor, div_13);
		};

		$.if(node_30, ($$render) => {
			if ($.get(has_subfields)) $$render(consequent_15);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'top-container svelte-1v2427j', null, classes, { top_level: top_level(), collapsed: $.get(collapsed) });
		classes_1 = $.set_class(div_1, 1, 'field-container svelte-1v2427j', null, classes_1, { minimal: $.get(minimal) });
		classes_2 = $.set_class(div_12, 1, 'footer svelte-1v2427j', null, classes_2, { hidden: $.get(hide_footer) });
	});

	$.bind_element_size(div_1, 'clientWidth', ($$value) => $.set(width, $$value));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);