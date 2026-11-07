import * as $ from 'svelte/internal/server';
import { ButtonGroup, Button, GradientButton } from "flowbite-svelte";

export default function More($$renderer) {
	$$renderer.push(`<div class="text-gray-900 dark:text-gray-100"><div class="py-4">Pills</div> `);

	ButtonGroup($$renderer, {
		class: 'space-x-px',
		children: ($$renderer) => {
			Button($$renderer, {
				pill: true,
				color: 'purple',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				pill: true,
				color: 'purple',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				pill: true,
				color: 'purple',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Messages`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="py-4">Standard buttons</div> `);

	ButtonGroup($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'red',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'green',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'yellow',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Messages`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="py-4">Outline</div> `);

	ButtonGroup($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				outline: true,
				color: 'red',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				outline: true,
				color: 'green',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				outline: true,
				color: 'yellow',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Messages`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="py-4">Gradient with shadows</div> `);

	ButtonGroup($$renderer, {
		children: ($$renderer) => {
			GradientButton($$renderer, {
				shadow: true,
				color: 'green',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			GradientButton($$renderer, {
				shadow: true,
				color: 'pink',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			GradientButton($$renderer, {
				shadow: true,
				color: 'teal',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Messages`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="py-4">Dualtone gradient</div> `);

	ButtonGroup($$renderer, {
		class: 'space-x-px',
		children: ($$renderer) => {
			GradientButton($$renderer, {
				color: 'purpleToBlue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			GradientButton($$renderer, {
				color: 'cyanToBlue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			GradientButton($$renderer, {
				color: 'greenToBlue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Messages`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="py-4">Dualtone gradient pill</div> `);

	ButtonGroup($$renderer, {
		class: 'space-x-px',
		children: ($$renderer) => {
			GradientButton($$renderer, {
				pill: true,
				color: 'purpleToBlue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			GradientButton($$renderer, {
				pill: true,
				color: 'cyanToBlue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			GradientButton($$renderer, {
				pill: true,
				color: 'greenToBlue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Messages`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}