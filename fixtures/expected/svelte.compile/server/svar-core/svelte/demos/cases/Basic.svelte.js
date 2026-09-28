import * as $ from 'svelte/internal/server';
import { Button, Segmented, Calendar } from "../../src/index";
import { getContext } from "svelte";

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { showNotice } = getContext("wx-helpers");

		function onclick() {
			showNotice({ text: "Button clicked" });
		}

		$$renderer.push(`<div class="demo-box"><h3>Buttons</h3> `);

		Button($$renderer, {
			onclick,
			type: 'primary',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Primary`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick,
			type: 'secondary',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Secondary`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick,
			type: 'danger',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Danger`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Segmented</h3> `);

		Segmented($$renderer, {
			value: '2',
			options: [
				{ id: "1", label: "One" },
				{ id: "2", label: "Two" },
				{ id: "3", label: "Three" }
			]
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Calendar</h3> <div style="width: 280px;">`);
		Calendar($$renderer, { value: new Date(2025, 4, 1) });
		$$renderer.push(`<!----></div></div>`);
	});
}