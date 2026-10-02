import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider, Combo, Button, TimePicker, Pager, Avatar } from "@svar-ui/svelte-core";
import { getData } from "../data";

var root = $.from_html(`<div class="topbar svelte-1j3ty4w"><!> <div class="block svelte-1j3ty4w"><div class="combo" style="width: 160px"><!></div> <div class="avatars svelte-1j3ty4w" style="width: 134px"><!></div> <div class="button svelte-1j3ty4w" style="width: 131px"><!></div> <div class="timepicker" style="width: 148px"><!></div> <div class="pager svelte-1j3ty4w" style="width: 308px"><!></div></div></div>`);

export default function Topbar($$anchor, $$props) {
	$.push($$props, true);

	const { employees, countries } = getData();
	var div = root();
	var node = $.child(div);

	Slider(node, { value: 78 });

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var node_1 = $.child(div_2);

	{
		const children = ($$anchor, $$arg0) => {
			let option = () => ($$arg0?.()).option;

			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, option().name));
			$.append($$anchor, text);
		};

		Combo(node_1, {
			get options() {
				return countries;
			},
			textField: 'name',
			placeholder: 'Click to select',
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Avatar(node_2, {
		get value() {
			return employees;
		},
		limit: 7,
		size: 28
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_3 = $.child(div_4);

	Button(node_3, {
		type: "primary",
		icon: "wxi-cat",
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Button');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_4 = $.child(div_5);

	TimePicker(node_4, { value: new Date(0, 0, 0, 14, 0, 0) });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_5 = $.child(div_6);

	Pager(node_5, { value: 2, total: 100 });
	$.reset(div_6);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}