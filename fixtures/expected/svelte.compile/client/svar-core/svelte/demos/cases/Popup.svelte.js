import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Popup, Slider } from "../../src/index";
import { env } from "@svar-ui/lib-dom";

var root = $.from_html(`<div class="popup svelte-pw83zv"><p>Some text here and there</p> <p>Some text here and there</p> <p>Some text here and there</p> <!></div>`);
var root_1 = $.from_html(`<div class="demo-box"><h3>Popup (local)</h3> <div class="demo-row"><!> <div><!></div> <!></div></div> <!>`, 1);

export default function Popup_1($$anchor, $$props) {
	$.push($$props, true);

	let node = null;
	let isOpen = $.state(false);
	let mode = $.state("bottom");
	let parent = $.state(null);

	function showAt() {
		$.set(isOpen, true);
		$.set(mode, "point");
		$.set(parent, null);
	}

	function showNext() {
		$.set(isOpen, true);
		$.set(mode, "bottom");
		$.set(parent, node, true);
	}

	function showCenter(ev) {
		$.set(isOpen, true);
		$.set(mode, "center");
		$.set(parent, env.getTopNode(ev.target), true);
	}

	function oncancel() {
		$.set(isOpen, false);
	}

	var fragment = root_1();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var node_1 = $.child(div_1);

	Button(node_1, {
		onclick: showAt,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show at position');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node_1, 2);
	var node_2 = $.child(div_2);

	Button(node_2, {
		onclick: showNext,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Show next to button');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.bind_this(div_2, ($$value) => node = $$value, () => node);

	var node_3 = $.sibling(div_2, 2);

	Button(node_3, {
		onclick: showCenter,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Show at center');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);

	var node_4 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			Popup($$anchor, {
				oncancel,
				get at() {
					return $.get(mode);
				},

				get parent() {
					return $.get(parent);
				},
				left: 100,
				top: 100,
				children: ($$anchor, $$slotProps) => {
					var div_3 = root();
					var node_5 = $.sibling($.child(div_3), 6);

					Slider(node_5, {});
					$.reset(div_3);
					$.append($$anchor, div_3);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_4, ($$render) => {
			if ($.get(isOpen)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}