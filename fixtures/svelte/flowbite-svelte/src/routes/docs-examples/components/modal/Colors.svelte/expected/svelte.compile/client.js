import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="text-base leading-relaxed">With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.</div>`);
var root_2 = $.from_html(`<div class="block space-y-4 md:space-y-0 md:space-x-2 rtl:space-x-reverse"><!> <!> <!> <!> <!></div> <!>`, 1);

export default function Colors($$anchor) {
	let openColor = $.state(false);
	let color = $.state("primary");

	function onclickColor(buttonColor) {
		$.set(color, buttonColor, true);
		$.set(openColor, true);
	}

	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		color: 'primary',
		onclick: () => onclickColor("primary"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Primary modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		color: 'red',
		onclick: () => onclickColor("red"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Red modal');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		color: 'green',
		onclick: () => onclickColor("green"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Green modal');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		color: 'blue',
		onclick: () => onclickColor("blue"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Blue modal');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		color: 'yellow',
		onclick: () => onclickColor("yellow"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Yellow modal');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_5 = $.sibling(div, 2);

	{
		const footer = ($$anchor) => {
			var fragment_1 = root();
			var node_6 = $.first_child(fragment_1);

			Button(node_6, {
				type: 'submit',
				get color() {
					return $.get(color);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('I accept');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				type: 'submit',
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Decline');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		Modal(node_5, {
			title: 'Terms of Service',
			form: true,
			get color() {
				return $.get(color);
			},

			get open() {
				return $.get(openColor);
			},

			set open($$value) {
				$.set(openColor, $$value, true);
			},
			footer,
			children: ($$anchor, $$slotProps) => {
				var div_1 = root_1();

				$.append($$anchor, div_1);
			},
			$$slots: { footer: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}