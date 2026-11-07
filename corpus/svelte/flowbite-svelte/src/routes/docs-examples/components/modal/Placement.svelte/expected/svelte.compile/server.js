import * as $ from 'svelte/internal/server';
import { Button, Modal, P } from "flowbite-svelte";

export default function Placement($$renderer) {
	let placement = "center";
	let openPlacement = false;

	const setPlacement = (newPlacement) => {
		placement = newPlacement;
		console.log("placement: ", placement);
		openPlacement = !openPlacement;
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="inline-grid grid-cols-3 grid-rows-3 gap-4">`);

		Button($$renderer, {
			onclick: () => setPlacement("top-left"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->top-left`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => setPlacement("top-center"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->top-center`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => setPlacement("top-right"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->top-right`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => setPlacement("center-left"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->center-left`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => setPlacement("center"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->center`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => setPlacement("center-right"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->center-right`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => setPlacement("bottom-left"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->bottom-left`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => setPlacement("bottom-center"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->bottom-center`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => setPlacement("bottom-right"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->bottom-right`);
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
				title: 'Terms of Service',
				form: true,
				placement,
				get open() {
					return openPlacement;
				},

				set open($$value) {
					openPlacement = $$value;
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