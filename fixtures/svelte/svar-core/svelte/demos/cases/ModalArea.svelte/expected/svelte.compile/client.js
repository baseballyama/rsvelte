import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Field, ColorPicker, ModalArea } from "../../src/index";

var root = $.from_html(`<div class="descr svelte-6645p5"><!></div> <div class="descr center svelte-6645p5"><p>To close the modal, click the button below</p> <!></div>`, 1);
var root_1 = $.from_html(`<div class="demo-box"><h3>Modal Area</h3> <p>Click button to show the modal area</p> <!> <!></div>`);

export default function ModalArea_1($$anchor) {
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
			ModalArea($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var div_1 = $.first_child(fragment_1);
					var node_2 = $.child(div_1);

					Field(node_2, {
						label: 'Color',
						children: ($$anchor, $$slotProps) => {
							ColorPicker($$anchor, {});
						},
						$$slots: { default: true }
					});

					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var node_3 = $.sibling($.child(div_2), 2);

					Button(node_3, {
						onclick: () => $.set(show, false),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Close');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_2);
					$.append($$anchor, fragment_1);
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