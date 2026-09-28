import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<i></i>`);
var root_1 = $.from_html(`<span class="wx-label svelte-n0xhas"> </span>`);
var root_2 = $.from_html(`<button><!> <!></button>`);
var root_3 = $.from_html(`<div></div>`);

export default function Tabs($$anchor, $$props) {
	$.push($$props, true);

	let options = $.prop($$props, 'options', 19, () => []),
		value = $.prop($$props, 'value', 15, ""),
		type = $.prop($$props, 'type', 3, "top"),
		css = $.prop($$props, 'css', 3, "");

	var div = root_3();

	$.each(div, 21, options, $.index, ($$anchor, option) => {
		var button = root_2();
		let classes;
		var node = $.child(button);

		{
			var consequent = ($$anchor) => {
				var i = root();

				$.template_effect(() => $.set_class(i, 1, `wx-icon ${$.get(option).icon ?? ''} ${!$.get(option).label ? 'wx-only' : ''}`, 'svelte-n0xhas'));
				$.append($$anchor, i);
			};

			$.if(node, ($$render) => {
				if ($.get(option).icon) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var span = root_1();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, $.get(option).label));
				$.append($$anchor, span);
			};

			$.if(node_1, ($$render) => {
				if ($.get(option).label) $$render(consequent_1);
			});
		}

		$.reset(button);

		$.template_effect(() => {
			$.set_attribute(button, 'title', $.get(option).title);
			$.set_attribute(button, 'data-tooltip-text', $.get(option).tooltip);
			classes = $.set_class(button, 1, 'svelte-n0xhas', null, classes, { 'wx-active': $.get(option).id == value() });
		});

		$.delegated('click', button, () => {
			value($.get(option).id);
			$$props.onchange && $$props.onchange({ value: value() });
		});

		$.append($$anchor, button);
	});

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `wx-tabs wx-${type() ?? ''} ${css() ?? ''}`, 'svelte-n0xhas'));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);