import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function FontWeight($$renderer) {
	P($$renderer, {
		size: '4xl',
		weight: 'thin',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '4xl',
		weight: 'extralight',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '4xl',
		weight: 'light',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '4xl',
		weight: 'normal',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '4xl',
		weight: 'medium',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '4xl',
		weight: 'semibold',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '4xl',
		weight: 'bold',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '4xl',
		weight: 'extrabold',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '4xl',
		weight: 'black',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}