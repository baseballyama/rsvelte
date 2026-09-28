import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import { page_context, page_type_context } from '$lib/builder/stores/context';
import { PageTypes, PageTypeFields } from '$lib/pocketbase/collections';
import UI from '../../ui/index.js';
import { Button } from '$lib/components/ui/button';
import { watch } from 'runed';
import { fieldTypes } from '../../stores/app';

var root = $.from_html(`from <strong> </strong>`, 1);
var root_1 = $.from_html(`<div class="foreign-notice svelte-piuez1"><p>This Page Field points to <strong> </strong> <!> </p> <p class="subtle mb-2 svelte-piuez1">Disconnecting will remove this link. If this block is also used on pages of the other page type, it may break there until reconfigured.</p> <!></div>`);
var root_2 = $.from_html(`<div class="PageFieldField"><div class="container svelte-piuez1"><!></div></div>`);

export default function PageFieldField($$anchor, $$props) {
	$.push($$props, true);

	const $fieldTypes = () => $.store_get(fieldTypes, '$fieldTypes', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const dispatch = createEventDispatcher();

	function validate_field_key(key) {
		// replace dash and space with underscore
		return key.replace(/-/g, '_').replace(/ /g, '_').toLowerCase();
	}

	// Determine active page type (Page editor or Page Type editor)
	const { value: page_ctx } = page_context.getOr({ value: null });

	const { value: page_type_ctx } = page_type_context.getOr({ value: null });

	const active_page_type = $.derived(() => {
		if (page_type_ctx) return page_type_ctx;
		if (page_ctx) return PageTypes.one(page_ctx.page_type);

		return null;
	});

	const active_page_type_name = $.derived(() => $.get(active_page_type)?.name || '');

	// Get fields only for the active page type
	const all_fields = $.derived(() => {
		const fields = $.get(active_page_type)?.fields?.() || [];

		return (fields || []).filter((f) => !f.parent).map((f) => ({ ...f }));
	});

	// Selected page field (may belong to different page type)
	const selected_page_field = $.derived(() => $$props.field.config?.field ? PageTypeFields.one($$props.field.config.field) : null);

	const selected_page_type = $.derived(() => $.get(selected_page_field)
		? PageTypes.one($.get(selected_page_field).page_type)
		: null);

	// True if the saved selection isn't available on the active page type
	const is_missing_in_active_type = $.derived(() => {
		if (!$.get(active_page_type)) return false;
		if (!$$props.field.config?.field) return false;

		return !$.get(all_fields).some((f) => f.id === $$props.field.config.field);
	});

	const field_list = $.derived(() => {
		return $.get(all_fields).map((f) => {
			const ft = $fieldTypes().find((t) => t.id === f.type);

			return {
				id: f.id,
				label: f.label || f.key,
				value: f.id,
				icon: ft?.icon
			};
		});
	});

	// auto-select first option (wait for field_list to populate), but avoid when foreign-linking is present or after manual disconnect
	let skip_autoselect = $.state(false);

	let autofilled = $.state(false);

	watch(
		() => ({
			list: $.get(field_list),
			missing: $.get(is_missing_in_active_type),
			skip: $.get(skip_autoselect)
		}),
		({ list, missing, skip }) => {
			const first_option = list[0];

			if (!first_option || $$props.field.config?.field || missing || skip || $.get(autofilled)) return;

			dispatch('input', {
				label: $$props.field.label || first_option.label,
				key: $$props.field.key || validate_field_key(first_option.label),
				config: { ...$$props.field.config, field: first_option.id }
			});

			if (!($$props.field.label || $$props.field.key)) {
				$.set(autofilled, true);
			}
		}
	);

	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();
			var p = $.child(div_2);
			var strong = $.sibling($.child(p));
			var text = $.only_child(strong, true);
			var node_1 = $.sibling(strong, 2);

			{
				var consequent = ($$anchor) => {
					var fragment = root();
					var strong_1 = $.sibling($.first_child(fragment));
					var text_1 = $.only_child(strong_1, true);

					$.template_effect(() => $.set_text(text_1, $.get(selected_page_type).name));
					$.append($$anchor, fragment);
				};

				var alternate = ($$anchor) => {
					var text_2 = $.text('from a different page type which is no longer available');

					$.append($$anchor, text_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(selected_page_type)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var text_3 = $.sibling(node_1);

			$.reset(p);

			var node_2 = $.sibling(p, 4);

			Button(node_2, {
				size: 'sm',
				variant: 'destructive',
				onclick: () => {
					$.set(skip_autoselect, true);
					dispatch('input', { config: { ...$$props.field.config, field: null } });
					setTimeout(() => $.set(skip_autoselect, false), 0);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Disconnect');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			$.template_effect(() => {
				$.set_text(text, $.get(selected_page_field)?.label || $.get(selected_page_field)?.key || 'Unknown field');
				$.set_text(text_3, ` and isn’t available on this page type (${$.get(active_page_type_name) ?? ''}).`);
			});

			$.append($$anchor, div_2);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => `Page Field${$.get(active_page_type_name) ? ` (${$.get(active_page_type_name)})` : ''}`);
				let $1 = $.derived(() => $$props.field.config?.field || ($.get(field_list).length > 0 ? $.get(field_list)[0].id : ''));

				let $2 = $.derived(() => Array.isArray($.get(field_list))
					? $.get(field_list).map((f) => ({ label: f.label, value: f.id, icon: f.icon }))
					: []);

				$.component(node_3, () => UI.Select, ($$anchor, UI_Select) => {
					UI_Select($$anchor, {
						fullwidth: true,
						get label() {
							return $.get($0);
						},

						get value() {
							return $.get($1);
						},

						get options() {
							return $.get($2);
						},

						$$events: {
							input: ({ detail }) => {
								const page_field = $.get(field_list).find((f) => f.id === detail);

								dispatch('input', {
									label: $.get(autofilled // only autofill if already autofilling
									) ? page_field?.label : $$props.field.label,
									key: $.get(autofilled)
										? validate_field_key(page_field?.label)
										: $$props.field.key,
									config: { ...$$props.field.config, field: page_field?.id }
								});
							}
						}
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(is_missing_in_active_type)) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}