import * as $ from 'svelte/internal/server';
import Button from "components/Button";
import Menu from "components/Menu";
import List from "components/List";
import Select from "components/Select";
import Icon from "components/Icon";
import TextField from "components/TextField";
import Slider from "components/Slider";
import Code from "docs/Code.svelte";
import menus from "examples/menus.txt";

export default function Menus($$renderer) {
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

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<small>Selected: ${$.escape(selected || 'nothing')}</small><br/> `);

		Menu($$renderer, {
			items,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			get value() {
				return selected;
			},

			set value($$value) {
				selected = $$value;
				$$settled = false;
			},

			$$slots: {
				activator: ($$renderer) => {
					$$renderer.push(`<div slot="activator">`);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->A menu`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}
			}
		});

		$$renderer.push(`<!----> `);
		Code($$renderer, { code: menus });
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}