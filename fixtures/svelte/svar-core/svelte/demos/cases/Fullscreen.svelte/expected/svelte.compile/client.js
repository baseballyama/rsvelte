import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Fullscreen } from "../../src/index";
import { Button } from "../../src/index";
import { ColorPicker } from "../../src/index";
import { DatePicker } from "../../src/index";

var root = $.from_html(`<div class="demo-box svelte-fufkhu"><h3>Fullscreen</h3> <p>Click button or press Ctrl + Shift + F to toggle fullscreen</p> <div class="demo-content svelte-fufkhu"><!> <!> <!></div></div>`);

var root_1 = $.from_html(`<div class="demo-box svelte-fufkhu"><h3>Fullscreen</h3> <p>When encountering multiple instances with same hotkeys selects
				focused area first</p> <p>Click button or press Ctrl + Shift + F to toggle fullscreen</p> <div class="demo-content svelte-fufkhu"><!> <!> <!></div></div>`);

var root_2 = $.from_html(`<div class="demo-button svelte-fufkhu"><!></div>`);
var root_3 = $.from_html(`<div class="demo-box svelte-fufkhu"><h3>Fullscreen with custom button</h3> <p>Click button or press Ctrl + Shift + Space to toggle fullscreen</p> <div class="demo-content svelte-fufkhu"><!> <!> <!></div></div>`);
var root_4 = $.from_html(`<div class="fullscreen-demo svelte-fufkhu"><!> <!> <!></div>`);

export default function Fullscreen_1($$anchor) {
	var div = root_4();
	var node = $.child(div);

	Fullscreen(node, {
		hotkey: 'ctrl+shift+f',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var div_2 = $.sibling($.child(div_1), 4);
			var node_1 = $.child(div_2);

			ColorPicker(node_1, { placeholder: 'Select a color...', value: '#65D3B3' });

			var node_2 = $.sibling(node_1, 2);

			ColorPicker(node_2, { placeholder: 'Select a color...', value: '#65D3B3' });

			var node_3 = $.sibling(node_2, 2);

			ColorPicker(node_3, { placeholder: 'Select a color...', value: '#65D3B3' });
			$.reset(div_2);
			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Fullscreen(node_4, {
		hotkey: 'ctrl+shift+f',
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_1();
			var div_4 = $.sibling($.child(div_3), 6);
			var node_5 = $.child(div_4);

			ColorPicker(node_5, { placeholder: 'Select a color...', value: '#ffc975' });

			var node_6 = $.sibling(node_5, 2);

			ColorPicker(node_6, { placeholder: 'Select a color...', value: '#ffc975' });

			var node_7 = $.sibling(node_6, 2);

			ColorPicker(node_7, { placeholder: 'Select a color...', value: '#ffc975' });
			$.reset(div_4);
			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 2);

	{
		const toggleButton = ($$anchor, onclick = $.noop, inFullscreen = $.noop) => {
			var div_5 = root_2();
			var node_9 = $.child(div_5);

			Button(node_9, {
				get onclick() {
					return onclick();
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, `Click me to ${inFullscreen() ? "exit" : "enter"} fullscreen`));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		Fullscreen(node_8, {
			hotkey: 'ctrl+shift+space',
			toggleButton,
			children: ($$anchor, $$slotProps) => {
				var div_6 = root_3();
				var div_7 = $.sibling($.child(div_6), 4);
				var node_10 = $.child(div_7);

				DatePicker(node_10, {});

				var node_11 = $.sibling(node_10, 2);

				DatePicker(node_11, {});

				var node_12 = $.sibling(node_11, 2);

				DatePicker(node_12, {});
				$.reset(div_7);
				$.reset(div_6);
				$.append($$anchor, div_6);
			},
			$$slots: { toggleButton: true, default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}