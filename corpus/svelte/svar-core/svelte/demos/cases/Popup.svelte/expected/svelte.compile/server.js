import * as $ from 'svelte/internal/server';
import { Button, Popup, Slider } from "../../src/index";
import { env } from "@svar-ui/lib-dom";

export default function Popup_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let node = null;
		let isOpen = false;
		let mode = "bottom";
		let parent = null;

		function showAt() {
			isOpen = true;
			mode = "point";
			parent = null;
		}

		function showNext() {
			isOpen = true;
			mode = "bottom";
			parent = node;
		}

		function showCenter(ev) {
			isOpen = true;
			mode = "center";
			parent = env.getTopNode(ev.target);
		}

		function oncancel() {
			isOpen = false;
		}

		$$renderer.push(`<div class="demo-box"><h3>Popup (local)</h3> <div class="demo-row">`);

		Button($$renderer, {
			onclick: showAt,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show at position`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div>`);

		Button($$renderer, {
			onclick: showNext,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show next to button`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Button($$renderer, {
			onclick: showCenter,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show at center`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> `);

		if (isOpen) {
			$$renderer.push('<!--[0-->');

			Popup($$renderer, {
				oncancel,
				at: mode,
				parent,
				left: 100,
				top: 100,
				children: ($$renderer) => {
					$$renderer.push(`<div class="popup svelte-pw83zv"><p>Some text here and there</p> <p>Some text here and there</p> <p>Some text here and there</p> `);
					Slider($$renderer, {});
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}