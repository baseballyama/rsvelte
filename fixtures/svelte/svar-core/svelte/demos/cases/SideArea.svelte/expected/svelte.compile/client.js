import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ColorPicker, Field, SideArea } from "../../src/index";

var root = $.from_html(`<div class="descr svelte-10nhmtn"><h3>Some content</h3> <!></div>`);
var root_1 = $.from_html(`<div class="demo-box"><h3>Side Area</h3> <p>Click button to show the side area</p> <!> <!></div>`);

export default function SideArea_1($$anchor) {
	let show = $.state(false);
	var div = root_1();
	var node = $.sibling($.child(div), 4);

	Button(node, {
		onclick: () => $.set(show, !$.get(show)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Click me');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			SideArea($$anchor, {
				oncancel: () => $.set(show, false),
				children: ($$anchor, $$slotProps) => {
					var div_1 = root();
					var node_2 = $.sibling($.child(div_1), 2);

					Field(node_2, {
						label: 'Color',
						children: ($$anchor, $$slotProps) => {
							ColorPicker($$anchor, {});
						},
						$$slots: { default: true }
					});

					$.reset(div_1);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}