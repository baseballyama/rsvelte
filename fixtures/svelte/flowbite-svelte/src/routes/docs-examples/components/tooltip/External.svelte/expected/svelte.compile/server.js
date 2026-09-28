import * as $ from 'svelte/internal/server';
import { Tooltip, Button } from "flowbite-svelte";

export default function External($$renderer) {
	let placement = "top";

	function onbeforetoggle(ev) {
		const trigger = ev.trigger;

		if (trigger?.id) {
			placement = trigger.id.replace("ref-", "");
		}
	}

	$$renderer.push(`<div id="ext-ref" class="rounded-lg border border-gray-200 p-2 dark:border-gray-600">External reference</div> <div class="space-x-4 rtl:space-x-reverse">`);

	Button($$renderer, {
		id: 'ref-left',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Left`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		id: 'ref-top',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Top`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		id: 'ref-right',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Right`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Tooltip($$renderer, {
		reference: '#ext-ref',
		triggeredBy: '[id^=\'ref-\']',
		placement,
		onbeforetoggle,
		class: 'w-64 text-sm font-light',
		children: ($$renderer) => {
			$$renderer.push(`<!---->And here's some amazing content. It's very engaging. Right?`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}