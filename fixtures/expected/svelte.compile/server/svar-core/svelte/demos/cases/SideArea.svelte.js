import * as $ from 'svelte/internal/server';
import { Button, ColorPicker, Field, SideArea } from "../../src/index";

export default function SideArea_1($$renderer) {
	let show = false;

	$$renderer.push(`<div class="demo-box"><h3>Side Area</h3> <p>Click button to show the side area</p> `);

	Button($$renderer, {
		onclick: () => show = !show,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Click me`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (show) {
		$$renderer.push('<!--[0-->');

		SideArea($$renderer, {
			oncancel: () => show = false,
			children: ($$renderer) => {
				$$renderer.push(`<div class="descr svelte-10nhmtn"><h3>Some content</h3> `);

				Field($$renderer, {
					label: 'Color',
					children: ($$renderer) => {
						ColorPicker($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}