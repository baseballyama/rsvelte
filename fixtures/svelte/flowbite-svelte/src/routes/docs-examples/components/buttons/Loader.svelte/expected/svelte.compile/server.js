import * as $ from 'svelte/internal/server';
import { Button, Spinner } from "flowbite-svelte";

export default function Loader($$renderer) {
	Button($$renderer, {
		loading: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Loading ...`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		loading: true,
		spinnerProps: { size: "4", color: "green" },
		children: ($$renderer) => {
			$$renderer.push(`<!---->Loading ...`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			Spinner($$renderer, { class: 'me-3', size: '4', color: 'gray' });
			$$renderer.push(`<!---->Loading ...`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		color: 'alternative',
		children: ($$renderer) => {
			Spinner($$renderer, { class: 'me-3', size: '4' });
			$$renderer.push(`<!---->Loading ...`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}