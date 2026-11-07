import * as $ from 'svelte/internal/server';
import { Button, Modal } from "carbon-components-svelte";

export default function ModalScrollingContent($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Create database`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			passiveModal: true,
			modalHeading: 'About Cloudant',
			hasScrollingContent: true,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<p>Cloudant is a fully managed, distributed database optimized for heavy
    workloads and fast-growing web and mobile apps, IBM Cloudant is available as
    an IBM Cloud® service with a 99.99% SLA.</p> <br/> <p>The database elastically scales throughput and storage, and its API and
    replication protocols are compatible with Apache CouchDB for hybrid or
    multicloud architectures.</p>`);
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