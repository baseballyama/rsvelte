import * as $ from 'svelte/internal/server';
import { Button, Field, ColorPicker, ModalArea } from "../../src/index";

export default function ModalArea_1($$renderer) {
	let show = false;

	$$renderer.push(`<div class="demo-box"><h3>Modal Area</h3> <p>Click button to show the modal area</p> `);

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

		ModalArea($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="descr svelte-6645p5">`);

				Field($$renderer, {
					label: 'Color',
					children: ($$renderer) => {
						ColorPicker($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="descr center svelte-6645p5"><p>To close the modal, click the button below</p> `);

				Button($$renderer, {
					onclick: () => show = false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Close`);
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