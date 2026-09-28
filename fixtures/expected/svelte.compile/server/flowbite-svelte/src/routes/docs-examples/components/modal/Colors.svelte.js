import * as $ from 'svelte/internal/server';
import { Button, Modal } from "flowbite-svelte";

export default function Colors($$renderer) {
	let openColor = false;
	let color = "primary";

	function onclickColor(buttonColor) {
		color = buttonColor;
		openColor = true;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="block space-y-4 md:space-y-0 md:space-x-2 rtl:space-x-reverse">`);

		Button($$renderer, {
			color: 'primary',
			onclick: () => onclickColor("primary"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Primary modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			color: 'red',
			onclick: () => onclickColor("red"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Red modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			color: 'green',
			onclick: () => onclickColor("green"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Green modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			color: 'blue',
			onclick: () => onclickColor("blue"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Blue modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			color: 'yellow',
			onclick: () => onclickColor("yellow"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Yellow modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		{
			function footer($$renderer) {
				Button($$renderer, {
					type: 'submit',
					color,
					children: ($$renderer) => {
						$$renderer.push(`<!---->I accept`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					type: 'submit',
					color: 'alternative',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Decline`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			Modal($$renderer, {
				title: 'Terms of Service',
				form: true,
				color,
				get open() {
					return openColor;
				},

				set open($$value) {
					openColor = $$value;
					$$settled = false;
				},
				footer,
				children: ($$renderer) => {
					$$renderer.push(`<div class="text-base leading-relaxed">With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.</div>`);
				},
				$$slots: { footer: true, default: true }
			});
		}

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}