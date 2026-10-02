import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RichSelect } from "@svar-ui/svelte-core";

var root = $.from_html(
	`<div style="display:flex;gap:8px"><div class="round"><div class="color"></div> <div class="color"></div></div> <span> </span></div> <style>.round {
					width: 20px;
					height: 20px;
					border-radius: 50%;
					display: flex;
				}
				.color {
					width: 50%;
					height: 100%;
				}
				.color:first-child {
					border-radius: 12px 0 0 12px;
				}
				.color:last-child {
					border-radius: 0 12px 12px 0;
				}</style>`,
	1
);

var root_1 = $.from_html(`<div style="width: 170px"><!></div>`);

export default function ThemeSelect($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, "willow");

	const skins = [
		{
			id: "willow",
			css: "wx-willow-theme",
			label: "Willow",
			color: "#37a9ef",
			color2: "#fff"
		},

		{
			id: "willow-dark",
			css: "wx-willow-dark-theme",
			label: "Dark",
			color: "#7a67eb",
			color2: "#384047"
		}
	];

	var div = root_1();
	var node = $.child(div);

	{
		const children = ($$anchor, option = $.noop) => {
			var fragment = root();
			var div_1 = $.first_child(fragment);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var div_4 = $.sibling(div_3, 2);

			$.reset(div_2);

			var span = $.sibling(div_2, 2);
			var text = $.only_child(span, true);

			$.reset(div_1);
			$.next(2);

			$.template_effect(() => {
				$.set_style(div_2, `border: 2px solid ${option().color ?? ''}`);
				$.set_style(div_3, `background:${option().color ?? ''}`);
				$.set_style(div_4, `background:${option().color2 ?? ''}`);
				$.set_text(text, option().label);
			});

			$.append($$anchor, fragment);
		};

		RichSelect(node, {
			get options() {
				return skins;
			},

			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}