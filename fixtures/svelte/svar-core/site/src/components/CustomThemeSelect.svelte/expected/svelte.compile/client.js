import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch } from "@svar-ui/svelte-core";

var root = $.from_html(`<div style="width: 170px"><!></div>`);

export default function CustomThemeSelect($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15);

	const skins = [
		{
			id: "willow",
			css: "wx-willow-theme",
			name: "Willow",
			color: "#37a9ef",
			color2: "#fff"
		},

		{
			id: "willow-dark",
			css: "wx-willow-dark-theme",
			name: "Dark",
			color: "#7a67eb",
			color2: "#384047"
		}
	];

	const swithValue = () => {
		const ind = (skins.findIndex((a) => a.id === value()) + 1) % skins.length;

		value(skins[ind].id);
	};

	var div = root();
	let classes;
	var node = $.child(div);

	{
		let $0 = $.derived(() => value() === "willow-dark");

		Switch(node, {
			get value() {
				return $.get($0);
			},
			onchange: swithValue
		});
	}

	$.reset(div);
	$.template_effect(() => classes = $.set_class(div, 1, 'custom svelte-nvqmc8', null, classes, { dark: value() === "willow-dark" }));
	$.append($$anchor, div);
	$.pop();
}