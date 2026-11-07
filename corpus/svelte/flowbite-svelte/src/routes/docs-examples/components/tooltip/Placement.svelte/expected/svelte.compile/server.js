import * as $ from 'svelte/internal/server';
import { Tooltip, Button } from "flowbite-svelte";

export default function Placement($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip left`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		placement: 'left',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Left`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip top`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		placement: 'top',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Top`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip bottom`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		placement: 'bottom',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Bottom`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Tooltip right`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		placement: 'right',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Right`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}