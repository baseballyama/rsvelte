import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<i></i>`);
var root_1 = $.from_html(`<span class="wx-label svelte-rsvny4"> </span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<button><!></button>`);
var root_4 = $.from_html(`<div></div>`);

export default function Segmented($$anchor, $$props) {
	$.push($$props, true);

	let options = $.prop($$props, 'options', 19, () => []),
		value = $.prop($$props, 'value', 15, ""),
		css = $.prop($$props, 'css', 3, "");

	function handleClick(id) {
		value(id);
		$$props.onchange && $$props.onchange({ value: value() });
	}

	var div = root_4();

	$.each(div, 21, options, (option) => option.id, ($$anchor, option) => {
		var button = root_3();
		let classes;
		var node = $.child(button);

		{
			var consequent = ($$anchor) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.snippet(node_1, () => $$props.children, () => ({ option: $.get(option) }));
				$.append($$anchor, fragment);
			};

			var alternate = ($$anchor) => {
				var fragment_1 = root_2();
				var node_2 = $.first_child(fragment_1);

				{
					var consequent_1 = ($$anchor) => {
						var i = root();

						$.template_effect(() => $.set_class(i, 1, `wx-icon ${$.get(option).icon ?? ''} ${!$.get(option).label ? 'wx-only' : ''}`, 'svelte-rsvny4'));
						$.append($$anchor, i);
					};

					$.if(node_2, ($$render) => {
						if ($.get(option).icon) $$render(consequent_1);
					});
				}

				var node_3 = $.sibling(node_2, 2);

				{
					var consequent_2 = ($$anchor) => {
						var span = root_1();
						var text = $.only_child(span, true);

						$.template_effect(() => $.set_text(text, $.get(option).label));
						$.append($$anchor, span);
					};

					$.if(node_3, ($$render) => {
						if ($.get(option).label) $$render(consequent_2);
					});
				}

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if ($$props.children) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(button);

		$.template_effect(() => {
			$.set_attribute(button, 'css', $.get(option).css);
			$.set_attribute(button, 'title', $.get(option).title);
			$.set_attribute(button, 'data-tooltip-text', $.get(option).tooltip);
			classes = $.set_class(button, 1, 'svelte-rsvny4', null, classes, { 'wx-selected': $.get(option).id == value() });
		});

		$.delegated('click', button, () => handleClick($.get(option).id));
		$.append($$anchor, button);
	});

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `wx-segmented ${css()}`, 'svelte-rsvny4'));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);