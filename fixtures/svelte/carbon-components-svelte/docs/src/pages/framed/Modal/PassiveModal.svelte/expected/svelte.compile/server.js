import * as $ from 'svelte/internal/server';
import { Button, Modal } from "carbon-components-svelte";

export default function PassiveModal($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			kind: 'tertiary',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Learn more`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			passiveModal: true,
			modalHeading: 'IBM Cloudant',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<p>IBM Cloudant is a distributed, secure database with global availability and
    zero vendor lock-in used to build web and mobile apps at scale.</p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}