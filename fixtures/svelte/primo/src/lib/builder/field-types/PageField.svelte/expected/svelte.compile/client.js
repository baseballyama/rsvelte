import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UI from '../ui/index.js';
import { site_context } from '$lib/builder/stores/context';

var root = $.from_html(`<div class="svelte-1u70j71"><!></div>`);

export default function PageField($$anchor, $$props) {
	$.push($$props, true);

	const { value: site } = site_context.getOr({ value: null });

	const selectable_pages = $.derived(() => {
		const pages = site?.pages() ?? [];
		const filtered = pages.filter((p) => p.page_type === $$props.field.config.page_type);

		return filtered;
	});

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => $$props.entry?.value || '');
		let $1 = $.derived(() => $.get(selectable_pages).map((page) => ({ value: page.id, label: page?.name })));

		$.component(node, () => UI.Select, ($$anchor, UI_Select) => {
			UI_Select($$anchor, {
				get label() {
					return $$props.field.label;
				},

				get value() {
					return $.get($0);
				},

				get options() {
					return $.get($1);
				},
				fullwidth: true,
				$$events: {
					input: ({ detail }) => {
						$$props.onchange({ [$$props.field.key]: { 0: { value: detail } } });
					}
				}
			});
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}