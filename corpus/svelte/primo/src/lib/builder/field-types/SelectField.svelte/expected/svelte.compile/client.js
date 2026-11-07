import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UI from '../ui';

var root = $.from_html(`<span>This field doesn't have any options</span>`);
var root_1 = $.from_html(`<div class="SelectField svelte-1hoyptm"><!></div>`);

export default function SelectField($$anchor, $$props) {
	$.push($$props, true);

	const value = $.derived(() => $$props.entry?.value);
	const options = $.derived(() => $$props.field.config?.options || []);

	// Track if we've auto-selected to prevent repeated calls
	let has_auto_selected = $.state(false);

	// Auto-select first option if no value is set (runs once when field has options and key)
	$.user_effect(() => {
		if (!$.get(has_auto_selected) && $$props.field.key && !$.get(value) && $.get(options).length > 0) {
			const first_option = $.get(options)[0];

			if (first_option && first_option.value !== undefined) {
				$.set(has_auto_selected, true);
				$$props.onchange({ [$$props.field.key]: { 0: { value: first_option.value } } });
			}
		}
	});

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => UI.Select, ($$anchor, UI_Select) => {
				UI_Select($$anchor, {
					fullwidth: true,
					get label() {
						return $$props.field.label;
					},

					get options() {
						return $.get(options);
					},

					get value() {
						return $.get(value);
					},
					disable_auto_highlight: true,
					$$events: {
						input: ({ detail }) => $$props.onchange({ [$$props.field.key]: { 0: { value: detail } } })
					}
				});
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($.get(options).length > 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}