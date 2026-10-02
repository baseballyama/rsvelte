import * as $ from 'svelte/internal/server';
import { Tabs } from "../../src/index";
import { getContext } from "svelte";

export default function Tabs_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { showNotice } = getContext("wx-helpers");

		const tabs = [
			{ id: 0, label: "Info", icon: "wxi-alert" },
			{ id: 1, label: "About" },
			{ id: 3, label: "", icon: "wxi-check" }
		];

		let active = 2;

		function onchange({ value }) {
			active = value;
			showNotice({ type: "info", expire: 2000, text: "ID: " + active });
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="demo-box"><h3>Tabs</h3> <div class="tabbar svelte-1r34yl9">`);

			Tabs($$renderer, {
				options: tabs,
				get value() {
					return active;
				},

				set value($$value) {
					active = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (active === 0) {
				$$renderer.push(`<!--[0--><div class="body svelte-1r34yl9">Info</div>`);
			} else if (active === 1) {
				$$renderer.push(`<!--[1--><div class="body svelte-1r34yl9">About</div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="body svelte-1r34yl9">Check</div>`);
			}

			$$renderer.push(`<!--]--> `);

			Tabs($$renderer, {
				options: tabs,
				type: 'bottom',
				get value() {
					return active;
				},

				set value($$value) {
					active = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <h3>onchange</h3> `);
			Tabs($$renderer, { options: tabs, value: 0, onchange });
			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}