import * as $ from 'svelte/internal/server';
import { Alert } from "flowbite-svelte";

export default function Default($$renderer) {
	Alert($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Default alert!</span> Change a few things up and try submitting again.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Alert($$renderer, {
		color: 'blue',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Info alert!</span> Change a few things up and try submitting again.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Alert($$renderer, {
		color: 'red',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Danger alert!</span> Change a few things up and try submitting again.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Alert($$renderer, {
		color: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Success alert!</span> Change a few things up and try submitting again.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Alert($$renderer, {
		color: 'yellow',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Warning alert!</span> Change a few things up and try submitting again.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Alert($$renderer, {
		color: 'secondary',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Dark alert!</span> Change a few things up and try submitting again.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}