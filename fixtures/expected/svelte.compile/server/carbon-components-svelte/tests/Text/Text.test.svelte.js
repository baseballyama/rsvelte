import * as $ from 'svelte/internal/server';
import Text from "carbon-components-svelte/Text/Text.svelte";

export default function Text_test($$renderer) {
	Text($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default body`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		tag: 'h1',
		type: 'productive-heading-04',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Heading`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		color: 'secondary',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Secondary text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		type: 'code-01',
		color: 'error',
		class: 'custom',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Code`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		tag: 'span',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Inline span`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		color: 'helper',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Color only`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		type: 'body-long-01',
		weight: 'semibold',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Semibold text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		type: 'body-long-01',
		italic: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Italic text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		type: 'body-long-01',
		family: 'mono',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Mono text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		type: 'body-short-01',
		wrap: 'break-word',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Break word text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		type: 'body-short-01',
		wrap: 'nowrap',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Nowrap text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		tag: 'h2',
		type: 'productive-heading-04',
		balance: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Balanced heading`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		type: 'body-long-01',
		maxWidth: 320,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Max width px`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		type: 'body-long-01',
		maxWidth: '38ch',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Max width ch`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		type: 'body-long-01',
		fullWidth: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Full width text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		type: 'body-long-01',
		weight: 'semibold',
		color: 'primary',
		maxWidth: '42ch',
		class: 'combined',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Combined modifiers`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		type: 'body-long-01',
		lines: 3,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Truncated text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}