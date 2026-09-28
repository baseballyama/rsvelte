import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UI from '../../ui/index.js';
import { site_context } from '$lib/builder/stores/context';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<div class="PagesField"><div class="container svelte-yy6369"><!></div></div>`);

export default function PageListField($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();
	const { value: site } = site_context.getOr({ value: null });
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $$props.field.config?.page_type || '');

		let $1 = $.derived(() => site?.page_types()?.map((page_type) => ({
			label: page_type.name,
			value: page_type.id,
			icon: page_type.icon
		})));

		$.component(node, () => UI.Select, ($$anchor, UI_Select) => {
			UI_Select($$anchor, {
				label: 'Page Type',
				get value() {
					return $.get($0);
				},
				fullwidth: true,
				get options() {
					return $.get($1);
				},

				$$events: {
					input: ({ detail }) => {
						dispatch('input', { config: { ...$$props.field.config, page_type: detail } });
					}
				}
			});
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}