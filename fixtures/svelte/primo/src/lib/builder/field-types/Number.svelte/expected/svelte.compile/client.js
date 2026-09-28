import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UI from '../ui';

var root = $.from_html(`<div class="svelte-1cqjwkz"><!></div>`);

export default function Number($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => $$props.entry?.value ?? '');

		$.component(node, () => UI.TextInput, ($$anchor, UI_TextInput) => {
			UI_TextInput($$anchor, $.spread_props(() => $$props.field, {
				get value() {
					return $.get($0);
				},
				oninput: (text) => $$props.onchange({ [$$props.field.key]: { 0: { value: parseFloat(text) || 0 } } }),
				type: 'number'
			}));
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}