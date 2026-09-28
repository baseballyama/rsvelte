import * as $ from 'svelte/internal/server';
import { RadioButton, RadioButtonGroup, Theme } from "carbon-components-svelte";

export default function ThemePersist($$renderer) {
	let theme = "g90";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Theme($$renderer, {
			persist: true,
			persistKey: '__carbon-theme',
			get theme() {
				return theme;
			},

			set theme($$value) {
				theme = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		RadioButtonGroup($$renderer, {
			legendText: 'Carbon theme',
			get selected() {
				return theme;
			},

			set selected($$value) {
				theme = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(["white", "g10", "g80", "g90", "g100"]);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let value = each_array[$$index];

					RadioButton($$renderer, { labelText: value, value });
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}