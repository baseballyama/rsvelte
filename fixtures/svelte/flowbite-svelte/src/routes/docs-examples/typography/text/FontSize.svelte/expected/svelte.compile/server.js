import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function FontSize($$renderer) {
	P($$renderer, {
		size: 'xs',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: 'base',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: 'lg',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: 'xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '2xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '3xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '4xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '5xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '6xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '7xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '8xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		size: '9xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aa`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}