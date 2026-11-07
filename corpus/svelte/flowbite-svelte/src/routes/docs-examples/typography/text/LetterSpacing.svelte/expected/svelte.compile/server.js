import * as $ from 'svelte/internal/server';
import { P } from "flowbite-svelte";

export default function LetterSpacing($$renderer) {
	P($$renderer, {
		space: 'tighter',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Flowbite app will help you improve yourself by analysing your everyday life.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		space: 'tight',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Flowbite app will help you improve yourself by analysing your everyday life.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		space: 'normal',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Flowbite app will help you improve yourself by analysing your everyday life.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		space: 'wide',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Flowbite app will help you improve yourself by analysing your everyday life.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		space: 'wider',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Flowbite app will help you improve yourself by analysing your everyday life.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		space: 'widest',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Flowbite app will help you improve yourself by analysing your everyday life.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}