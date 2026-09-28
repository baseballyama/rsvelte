import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Label } from '@smui/button';
import Textfield from '@smui/textfield';
import { announce } from '@smui/common/internal';

var root = $.from_html(`<div>Note that this demo will not work for you if you are not using a screen
  reader. <!> <div style="text-align: end;"><!> <!></div></div>`);

export default function _Announce($$anchor, $$props) {
	$.push($$props, true);

	let text = $.state('');

	function loremIpsum() {
		$.set(text, 'But I must explain to you how all this mistaken idea of denouncing of ' + 'a pleasure and praising pain was born and I will give you a complete ' + 'account of the system, and expound the actual teachings of the great ' + 'explorer of the truth, the master-builder of human happiness. No one ' + 'rejects, dislikes, or avoids pleasure itself, because it is pleasure, ' + 'but because those who do not know how to pursue pleasure rationally ' + 'encounter consequences that are extremely painful. Nor again is there ' + 'anyone who loves or pursues or desires to obtain pain of itself, ' + 'because it is pain, but occasionally circumstances occur in which ' + 'toil and pain can procure him some great pleasure. To take a trivial ' + 'example, which of us ever undertakes laborious physical exercise, ' + 'except to obtain some advantage from it? But who has any right to ' + 'find fault with a man who chooses to enjoy a pleasure that has no ' + 'annoying consequences, or one who avoids a pain that produces no ' + 'resultant pleasure?');
	}

	var div = root();
	var node = $.sibling($.child(div));

	Textfield(node, {
		label: 'Text',
		textarea: true,
		style: 'width: 100%; margin: 1em 0 .5em;',
		get value() {
			return $.get(text);
		},

		set value($$value) {
			$.set(text, $$value, true);
		}
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Button(node_1, {
		onclick: loremIpsum,
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Fill Lorem Ipsum');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => announce($.get(text), { priority: 'assertive' }),
		variant: 'raised',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Speak');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}