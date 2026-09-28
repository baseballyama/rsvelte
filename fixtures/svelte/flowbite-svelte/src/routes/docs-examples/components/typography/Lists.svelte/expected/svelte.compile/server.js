import * as $ from 'svelte/internal/server';
import { List, Li, Heading } from "flowbite-svelte";

export default function Lists($$renderer) {
	Heading($$renderer, {
		tag: 'h5',
		children: ($$renderer) => {
			$$renderer.push(`<!---->List disc`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	List($$renderer, {
		class: 'list-disc',
		children: ($$renderer) => {
			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Design`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Develop`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Test`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Heading($$renderer, {
		tag: 'h5',
		children: ($$renderer) => {
			$$renderer.push(`<!---->List decimal`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	List($$renderer, {
		class: 'list-decimal',
		children: ($$renderer) => {
			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Design`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Develop`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Test`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Heading($$renderer, {
		tag: 'h5',
		children: ($$renderer) => {
			$$renderer.push(`<!---->List none`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	List($$renderer, {
		class: 'list-none',
		children: ($$renderer) => {
			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Design`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Develop`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Test`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}