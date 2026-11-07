import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutside } from "./utils";

var root = $.from_html(`<span>&nbsp;</span>`);
var root_1 = $.from_html(`<div role="button" tabindex="0"> </div>`);
var root_2 = $.from_html(`<div class="pvtDropdownMenu" style="z-index: 100;"></div>`);
var root_3 = $.from_html(`<div class="pvtDropdown"><button><div class="pvtDropdownIcon"> </div> <!></button> <!></div>`);

export default function Dropdown($$anchor, $$props) {
	$.push($$props, true);

	let current = $.prop($$props, 'current', 15),
		values = $.prop($$props, 'values', 19, () => []),
		onchange = $.prop($$props, 'onchange', 3, undefined);

	let open = $.state(false);
	const toggle = () => $.set(open, !$.get(open));
	var div = root_3();
	var button = $.child(div);
	var div_1 = $.child(button);
	var text = $.only_child(div_1, true);
	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, current()));
			$.append($$anchor, text_1);
		};

		var alternate = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (current()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var node_1 = $.sibling(button, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_2();

			$.each(div_2, 20, values, (r) => r, ($$anchor, r) => {
				var div_3 = root_1();
				let classes;
				var text_2 = $.only_child(div_3, true);

				$.template_effect(() => {
					classes = $.set_class(div_3, 1, 'pvtDropdownValue', null, classes, { pvtDropdownActiveValue: r === current() });
					$.set_text(text_2, r);
				});

				$.delegated('click', div_3, () => {
					if (current() !== r) {
						current(r);
						onchange()?.(current());
					}

					toggle();
				});

				$.append($$anchor, div_3);
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(open)) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.action(div, ($$node) => clickOutside?.($$node));

	$.template_effect(() => {
		$.set_class(button, 1, "pvtDropdownValue pvtDropdownCurrent " + ($.get(open) ? "pvtDropdownCurrentOpen" : ""));
		$.set_text(text, $.get(open) ? "×" : "▾");
	});

	$.event('outside', div, () => $.set(open, false));
	$.delegated('click', button, toggle);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);