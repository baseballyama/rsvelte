import * as $ from 'svelte/internal/server';
import { Tooltip, Button, P } from "flowbite-svelte";

export default function Default2($$renderer) {
	Button($$renderer, {
		id: 'specific-button-anywhere-on-page',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default tooltip`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->hi mom`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->lorem ipsum, content blah blah, other stuff`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		triggeredBy: '#specific-button-anywhere-on-page',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip content`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}