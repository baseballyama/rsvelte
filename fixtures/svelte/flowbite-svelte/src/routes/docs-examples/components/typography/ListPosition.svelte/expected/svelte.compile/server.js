import * as $ from 'svelte/internal/server';
import { List, Li, Heading } from "flowbite-svelte";

export default function ListPosition($$renderer) {
	Heading($$renderer, {
		tag: 'h5',
		children: ($$renderer) => {
			$$renderer.push(`<!---->List inside`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	List($$renderer, {
		position: 'inside',
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
			$$renderer.push(`<!---->List outside`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	List($$renderer, {
		position: 'outside',
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