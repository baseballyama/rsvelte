import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { uid } from "@svar-ui/lib-dom";
import RadioButton from "./RadioButton.svelte";
import { setContext } from "svelte";

var root = $.from_html(`<div class="wx-item svelte-l13ghu"><!></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function RadioButtonGroup($$anchor, $$props) {
	$.push($$props, true);

	let options = $.prop($$props, 'options', 19, () => [{}]),
		value = $.prop($$props, 'value', 15, ""),
		type = $.prop($$props, 'type', 3, ""),
		css = $.prop($$props, 'css', 3, "");

	setContext("wx-input-id", null);

	const name = uid();

	function handleChange(ev) {
		value(ev.inputValue);
		$$props.onchange && $$props.onchange({ value: value() });
	}

	var div = root_1();

	$.each(div, 21, options, $.index, ($$anchor, option) => {
		var div_1 = root();
		var node = $.child(div_1);

		{
			let $0 = $.derived(() => value() === $.get(option).id);

			RadioButton(node, {
				get label() {
					return $.get(option).label;
				},

				get inputValue() {
					return $.get(option).id;
				},

				get value() {
					return $.get($0);
				},

				get name() {
					return name;
				},
				onchange: handleChange
			});
		}

		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `wx-radiogroup ${(type() && `wx-${type()}`) ?? ''} ${css() ?? ''}`, 'svelte-l13ghu'));
	$.append($$anchor, div);
	$.pop();
}