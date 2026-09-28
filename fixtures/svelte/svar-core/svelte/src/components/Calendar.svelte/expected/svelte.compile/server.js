import * as $ from 'svelte/internal/server';
import Panel from "./calendar/Panel.svelte";
import Locale from "../Locale.svelte";

export default function Calendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			current = void 0,
			markers = null,
			buttons = ["clear", "today"],
			css = "",
			onchange
		} = $$props;

		function fixCurrent(force) {
			if (!current || force) current = value ? new Date(value) : new Date();

			current.setDate(1);
		}

		fixCurrent(value);

		function change(v) {
			const x = v.value;

			if (x) {
				value = new Date(x);
				fixCurrent(true);
			} else {
				value = null;
			}

			onchange && onchange({ value });
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Locale($$renderer, {
				children: ($$renderer) => {
					Panel($$renderer, {
						value,
						markers,
						buttons,
						css,
						onchange: change,
						get current() {
							return current;
						},

						set current($$value) {
							current = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value, current });
	});
}