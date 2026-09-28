import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<div slot="bar"></div>`);
var root_1 = $.from_html(`<custom-element><div><div slot="foo"></div></div> <!></custom-element>`, 2);

export default function Input($$anchor) {
	let thing = false;

	Nested($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var custom_element = root_1();
			var node = $.sibling($.child(custom_element), 2);

			{
				var consequent = ($$anchor) => {
					var div = root();

					$.append($$anchor, div);
				};

				$.if(node, ($$render) => {
					if (thing) $$render(consequent);
				});
			}

			$.reset(custom_element);
			$.append($$anchor, custom_element);
		},
		$$slots: { default: true }
	});
}