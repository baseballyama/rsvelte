import * as $ from 'svelte/internal/server';
import { Popover, Button } from "flowbite-svelte";

export default function Placement($$renderer) {
	let placement = "bottom";

	function onbeforetoggle(ev) {
		const trigger = ev.trigger;

		if (trigger?.id) {
			placement = trigger.id.replace("placement-", "");
		}
	}

	Button($$renderer, {
		id: 'placement-top',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Top popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="space-x-4 rtl:space-x-reverse">`);

	Button($$renderer, {
		id: 'placement-left',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Left popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		id: 'placement-right',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Right popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Button($$renderer, {
		id: 'placement-bottom',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Bottom popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Popover($$renderer, {
		triggeredBy: '[id^=\'placement-\']',
		placement,
		class: 'w-64 text-sm font-light ',
		title: `Popover ${$.stringify(placement)}`,
		onbeforetoggle,
		children: ($$renderer) => {
			$$renderer.push(`<!---->And here's some amazing content. It's very engaging. Right?`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}