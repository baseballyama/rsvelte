import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "components/Button";
import Menu from "components/Menu";
import List from "components/List";
import Select from "components/Select";
import Icon from "components/Icon";
import TextField from "components/TextField";
import Slider from "components/Slider";
import Code from "docs/Code.svelte";
import menus from "examples/menus.txt";

var root = $.from_html(`<div slot="activator"><!></div>`);
var root_1 = $.from_html(`<small> </small><br/> <!> <!>`, 1);

export default function Menus($$anchor) {
	let open = false;
	let open2 = false;
	let selected = "";

	const items = [
		{ value: 1, text: "One" },
		{ value: 2, text: "Two" },
		{ value: 3, text: "Three" },
		{ value: 4, text: "Four" },
		{ value: 5, text: "Five" }
	];

	var fragment = root_1();
	var small = $.first_child(fragment);
	var text = $.only_child(small);
	var node = $.sibling(small, 3);

	Menu(node, {
		get items() {
			return items;
		},

		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		get value() {
			return selected;
		},

		set value($$value) {
			selected = $$value;
		},

		$$slots: {
			activator: ($$anchor, $$slotProps) => {
				var div = root();
				var node_1 = $.child(div);

				Button(node_1, {
					$$events: { click: () => open = !open },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('A menu');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	Code(node_2, {
		get code() {
			return menus;
		}
	});

	$.template_effect(() => $.set_text(text, `Selected: ${(selected || 'nothing') ?? ''}`));
	$.append($$anchor, fragment);
}