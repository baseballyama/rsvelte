import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from "./Checkbox.svelte";
import { setContext } from "svelte";

var root = $.from_html(`<div class="wx-item svelte-1577ppk"><!></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function CheckboxGroup($$anchor, $$props) {
	$.push($$props, true);

	let options = $.prop($$props, 'options', 19, () => []),
		value = $.prop($$props, 'value', 31, () => $.proxy([])),
		type = $.prop($$props, 'type', 3, ""),
		css = $.prop($$props, 'css', 3, "");

	setContext("wx-input-id", null);

	function handleChange(obj) {
		if (obj.value) value([...value(), obj.inputValue]); else value(value().filter((a) => a != obj.inputValue));

		$$props.onchange && $$props.onchange({ value: value() });
	}

	var div = root_1();

	$.each(div, 21, options, $.index, ($$anchor, option) => {
		var div_1 = root();
		var node = $.child(div_1);

		{
			let $0 = $.derived(() => value().includes($.get(option).id));

			Checkbox(node, {
				get label() {
					return $.get(option).label;
				},

				get inputValue() {
					return $.get(option).id;
				},

				get value() {
					return $.get($0);
				},
				onchange: handleChange
			});
		}

		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `wx-checkboxgroup ${(type() && `wx-${type()}`) ?? ''} ${css() ?? ''}`, 'svelte-1577ppk'));
	$.append($$anchor, div);
	$.pop();
}