import * as $ from 'svelte/internal/server';
import { Heading, P, Button } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

export default function Default($$renderer) {
	$$renderer.push(`<div class="text-center">`);

	Heading($$renderer, {
		tag: 'h1',
		class: 'mb-4 text-4xl font-extrabold  md:text-5xl lg:text-6xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->We invest in the world’s potential`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		class: 'mb-6 text-lg sm:px-16 lg:text-xl xl:px-48 dark:text-gray-400',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Learn more `);
			ArrowRightOutline($$renderer, { class: 'ms-2 h-6 w-6' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}