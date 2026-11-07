import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card from '$lib/builder/ui/Card.svelte';
import { useContent, useEntries } from '$lib/Content.svelte';
import { fieldTypes } from '../../stores/app/index.js';
import Icon from '@iconify/svelte';
import { EyeOff } from 'lucide-svelte';
import { current_user } from '$lib/pocketbase/user';
import { locale } from '../../stores/app/misc';
import { page_context, page_type_context } from '$lib/builder/stores/context';
import { PageTypes, PageTypeFields } from '$lib/pocketbase/collections';

var root = $.from_html(`<span>Field type for the field is not found!</span>`);
var root_1 = $.from_html(`<div class="hidden-field svelte-1fa7dtb"><!> <span><strong> </strong> isn't available on this page type and is hidden from content editors.</span></div>`);
var root_2 = $.from_html(`<!> <span>Site Field</span>`, 1);
var root_3 = $.from_html(`<!> <span>Page Field</span>`, 1);
var root_4 = $.from_html(`<div class="dynamic-header svelte-1fa7dtb"><!></div>`);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function EntryContent($$anchor, $$props) {
	$.push($$props, true);

	const $fieldTypes = () => $.store_get(fieldTypes, '$fieldTypes', $$stores);
	const $locale = () => $.store_get(locale, '$locale', $$stores);
	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const field_type = $.derived(() => $fieldTypes().find((ft) => ft.id === $$props.field.type));
	const Field_Component = $.derived(() => $.get(field_type)?.component);
	const _data = $.derived(() => useContent($$props.entity, { target: 'cms' }));
	const data = $.derived(() => $.get(_data) && ($.get(_data)[$locale()] ?? {}));

	// Page Field relevance: hide Entry UI for content editors if the selected page field
	// does not belong to the active page type's field list.
	const { value: page_ctx } = page_context.getOr({ value: null });

	const { value: page_type_ctx } = page_type_context.getOr({ value: null });

	const active_page_type = $.derived(() => {
		if (page_type_ctx) return page_type_ctx;
		if (page_ctx) return PageTypes.one(page_ctx.page_type);

		return null;
	});

	const selected_page_field = $.derived(() => $$props.field.type === 'page-field' && $$props.field.config?.field ? PageTypeFields.one($$props.field.config.field) : null);

	const selected_page_type_page_type = $.derived(() => $.get(selected_page_field)
		? PageTypes.one($.get(selected_page_field).page_type)
		: null);

	const is_page_field_irrelevant = $.derived(() => {
		if ($$props.field.type !== 'page-field') return false;
		if (!$.get(selected_page_field)) return false;
		if (!$.get(active_page_type)) return false;

		return $.get(selected_page_field).page_type !== $.get(active_page_type).id;
	});

	const is_visible = $.derived(() => {
		// No condition set → visible
		if (!$$props.field.config?.condition) return true;

		const { field: field_to_check, value: expected, comparison } = $$props.field.config.condition;

		// Find the field this condition depends on (limited to same entity and, if applicable, same parent)
		const comparable_field = $$props.fields.find((f) => f.id === field_to_check);

		if (!comparable_field) return true; // if missing, fail open

		// Prefer live entries (respecting parent nesting) so visibility reacts immediately to edits
		const [comparable_entry] = useEntries($$props.entity, comparable_field, $$props.parent) ?? [];

		const comparable_value = comparable_entry?.value ?? $.get(data)?.[comparable_field.key];

		if (comparison === '=' && expected === comparable_value) return true;
		if (comparison === '!=' && expected !== comparable_value) return true;

		return false;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					var div = root_1();
					var node_2 = $.child(div);

					EyeOff(node_2, { size: '14' });

					var span_1 = $.sibling(node_2, 2);
					var strong = $.child(span_1);
					var text = $.only_child(strong, true);

					$.next();
					$.reset(span_1);
					$.reset(div);
					$.template_effect(() => $.set_text(text, $$props.field.label));
					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if ($current_user()?.siteRole === 'developer') $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var consequent_6 = ($$anchor) => {
			const computed_const = $.derived(() => {
				const [entry] = useEntries($$props.entity, $$props.field, $$props.parent) ?? [];

				return { entry };
			});

			const title = $.derived(() => ['repeater', 'group'].includes($$props.field.type) ? $$props.field.label : null);
			const icon = $.derived(() => undefined);
			var fragment_2 = root_5();
			var node_3 = $.first_child(fragment_2);

			{
				var consequent_5 = ($$anchor) => {
					var div_1 = root_4();
					var node_4 = $.child(div_1);

					{
						var consequent_3 = ($$anchor) => {
							var fragment_3 = root_2();
							var node_5 = $.first_child(fragment_3);

							Icon(node_5, { icon: 'gg:website' });
							$.next(2);
							$.append($$anchor, fragment_3);
						};

						var consequent_4 = ($$anchor) => {
							var fragment_4 = root_3();
							var node_6 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => $.get(selected_page_type_page_type)?.icon || 'iconoir:page');

								Icon(node_6, {
									get icon() {
										return $.get($0);
									}
								});
							}

							$.next(2);
							$.append($$anchor, fragment_4);
						};

						$.if(node_4, ($$render) => {
							if ($$props.field.type === 'site-field') $$render(consequent_3); else if ($$props.field.type === 'page-field') $$render(consequent_4, 1);
						});
					}

					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				$.if(node_3, ($$render) => {
					if ($$props.field.type === 'site-field' || $$props.field.type === 'page-field') $$render(consequent_5);
				});
			}

			var node_7 = $.sibling(node_3, 2);

			Card(node_7, {
				get title() {
					return $.get(title);
				},
				icon: $.get(icon),
				get minimal() {
					return $$props.minimal;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_8 = $.first_child(fragment_5);

					$.component(node_8, () => $.get(Field_Component), ($$anchor, Field_Component_1) => {
						Field_Component_1($$anchor, {
							get entity() {
								return $$props.entity;
							},

							get field() {
								return $$props.field;
							},

							get fields() {
								return $$props.fields;
							},

							get entries() {
								return $$props.entries;
							},

							get entry() {
								return $.get(computed_const).entry;
							},

							get level() {
								return $$props.level;
							},

							get onchange() {
								return $$props.onchange;
							},

							get ondelete() {
								return $$props.ondelete;
							},

							get parent() {
								return $$props.parent;
							}
						});
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		};

		var consequent_7 = ($$anchor) => {};

		$.if(node, ($$render) => {
			if (!$.get(Field_Component)) $$render(consequent); else if ($$props.field.type === 'page-field' && $.get(is_page_field_irrelevant)) $$render(consequent_2, 1); else if ($.get(is_visible)) $$render(consequent_6, 2); else if ($current_user()?.siteRole === 'developer' && !$.get(is_visible)) $$render(consequent_7, 3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}