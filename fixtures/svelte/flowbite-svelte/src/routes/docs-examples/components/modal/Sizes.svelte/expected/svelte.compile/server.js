import * as $ from 'svelte/internal/server';
import { Button, Modal, P } from "flowbite-svelte";

export default function Sizes($$renderer) {
	let openModal = false;
	let size = "md"; // Set default value

	function onclick(modalSize) {
		size = modalSize;
		openModal = true;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="block space-y-4 md:space-y-0 md:space-x-4 rtl:space-x-reverse">`);

		Button($$renderer, {
			onclick: () => onclick("xs"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->xs`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => onclick("sm"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->sm`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => onclick("md"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->md`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => onclick("lg"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->lg`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => onclick("xl"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->xl`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		{
			function footer($$renderer) {
				Button($$renderer, {
					type: 'submit',
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
				form: true,
				title: 'Terms of Service',
				size,
				get open() {
					return openModal;
				},

				set open($$value) {
					openModal = $$value;
					$$settled = false;
				},
				footer,
				children: ($$renderer) => {
					P($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					P($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to
    notify users as soon as possible of high-risk data breaches that could personally affect them.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
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