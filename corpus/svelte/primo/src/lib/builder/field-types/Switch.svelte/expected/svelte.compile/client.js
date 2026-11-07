import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UI from '../ui';

var root = $.from_html(`<div class="svelte-1cpp05m"><!></div>`);

export default function Switch($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => $$props.entry?.value ?? false);

		$.component(node, () => UI.Switch, ($$anchor, UI_Switch) => {
			UI_Switch($$anchor, {
				get label() {
					return $$props.field.label;
				},

				get field() {
					return $$props.field;
				},

				get value() {
					return $.get($0);
				},
				oninput: (value) => $$props.onchange({ [$$props.field.key]: { 0: { value } } })
			});
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}