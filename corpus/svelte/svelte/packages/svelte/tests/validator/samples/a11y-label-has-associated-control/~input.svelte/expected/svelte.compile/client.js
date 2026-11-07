import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LabelComponent from './label.svelte';

var root = $.from_html(`<input type="text"/>`);
var root_1 = $.from_html(`G <input type="text"/>`, 1);
var root_2 = $.from_html(`<label>A</label> <label for="id">B</label> <label>C <input type="text"/></label> <label>D <button>D</button></label> <label>E <span></span></label> <label>F <!></label> <!> <label>E <span></span></label>`, 1);

export default function Input($$anchor) {
	var fragment = root_2();
	var label = $.sibling($.first_child(fragment), 10);
	var node = $.sibling($.child(label));

	{
		var consequent = ($$anchor) => {
			var input = root();

			$.append($$anchor, input);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.reset(label);

	var node_1 = $.sibling(label, 2);

	LabelComponent(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var label_1 = $.sibling(node_1, 2);

	$.attribute_effect(label_1, () => ({ ...forMightBeInHere }));
	$.append($$anchor, fragment);
}