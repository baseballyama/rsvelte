import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckBox from './CheckBox.svelte';

var root = $.from_html(`<!> <br/> `, 1);

export default function Main($$anchor) {
	let checked = $.state(false);

	function wrap() {
		return {
			get checked() {
				return $.get(checked);
			},

			set checked(v) {
				$.set(checked, v, true);
			}
		};
	}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const obj = $.derived(wrap);

			CheckBox($$anchor, {
				type: 'checkbox',
				get checked() {
					return $.get(obj).checked;
				},

				set checked($$value) {
					$.get(obj).checked = $$value;
				}
			});
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var text = $.sibling(node, 3);

	$.template_effect(() => $.set_text(text, ` Checked: ${$.get(checked) ?? ''}`));
	$.append($$anchor, fragment);
}