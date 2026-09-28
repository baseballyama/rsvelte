import * as $ from 'svelte/internal/server';
import { Button, Modal, P } from "flowbite-svelte";

export default function Events($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			onclick: () => open = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Default modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		{
			function footer($$renderer) {
				Button($$renderer, {
					type: 'submit',
					value: 'accept',
					children: ($$renderer) => {
						$$renderer.push(`<!---->I accept`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					type: 'submit',
					value: 'decline',
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
				onsubmit: () => alert(`SUBMIT: Form is about to be submitted.`),
				oncancel: () => alert("CANCEL: User canceled the dialog"),
				onclose: (ev) => alert(`CLOSE: Dialog closed with "${ev.target?.returnValue || "no"}" action.`),
				title: 'Terms of Service',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
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
							$$renderer.push(`<!---->The European Union's General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to
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