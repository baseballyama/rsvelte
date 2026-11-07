import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal } from "carbon-components-svelte";

var root = $.from_html(
	`<p>Cloudant is a fully managed, distributed database optimized for heavy
    workloads and fast-growing web and mobile apps, IBM Cloudant is available as
    an IBM Cloud® service with a 99.99% SLA.</p> <br/> <p>The database elastically scales throughput and storage, and its API and
    replication protocols are compatible with Apache CouchDB for hybrid or
    multicloud architectures.</p>`,
	1
);

var root_1 = $.from_html(`<!> <!>`, 1);

export default function ModalScrollingContent($$anchor) {
	let open = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Create database');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		passiveModal: true,
		modalHeading: 'About Cloudant',
		hasScrollingContent: true,
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(4);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}