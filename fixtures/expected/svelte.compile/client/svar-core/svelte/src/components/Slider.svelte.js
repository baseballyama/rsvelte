import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getInputId } from "./helpers/getInputId.js";

var root = $.from_html(`<label class="svelte-1082wop"> </label>`);
var root_1 = $.from_html(`<div><!> <div class="svelte-1082wop"><input type="range" class="svelte-1082wop"/></div></div>`);

export default function Slider($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, ""),
		width = $.prop($$props, 'width', 3, ""),
		min = $.prop($$props, 'min', 3, 0),
		max = $.prop($$props, 'max', 3, 100),
		value = $.prop($$props, 'value', 15, 0),
		step = $.prop($$props, 'step', 3, 1),
		title = $.prop($$props, 'title', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		css = $.prop($$props, 'css', 3, "");

	const inputId = $.proxy(getInputId($$props.id));

	let bgStyle = $.derived(() => () => {
		return disabled()
			? ""
			: `background: linear-gradient(90deg, var(--wx-slider-primary) 0% ${$.get(progress)}, var(--wx-slider-background) ${$.get(progress)} 100%);`;
	});

	let progress = $.derived(() => (value() - min()) / (max() - min()) * 100 + "%");
	let previousInput = value();
	let previousValue = value();

	function oninput({ target }) {
		value(target.value * 1);
		$$props.onchange && $$props.onchange({ value: value(), previous: previousInput, input: true });
		previousInput = value();
	}

	function change({ target }) {
		value(target.value * 1);
		$$props.onchange && $$props.onchange({ value: value(), previous: previousValue });
		previousValue = value();
	}

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var label_1 = root();
			var text = $.only_child(label_1, true);

			$.template_effect(() => {
				$.set_attribute(label_1, 'for', $$props.id);
				$.set_text(text, label());
			});

			$.append($$anchor, label_1);
		};

		$.if(node, ($$render) => {
			if (label()) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var input = $.child(div_1);

	$.remove_input_defaults(input);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, `wx-slider ${css() ?? ''}`, 'svelte-1082wop');
			$.set_style(div, width() ? `width: ${width()}` : "");
			$.set_attribute(div, 'title', title());
			$.set_attribute(div, 'data-tooltip-text', $$props.tooltip);
			$.set_attribute(input, 'id', inputId);
			$.set_attribute(input, 'min', min());
			$.set_attribute(input, 'max', max());
			$.set_attribute(input, 'step', step());
			input.disabled = disabled();
			$.set_value(input, value());
			$.set_style(input, $0);
		},
		[() => $.get(bgStyle)()]
	);

	$.delegated('input', input, oninput);
	$.delegated('change', input, change);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input', 'change']);