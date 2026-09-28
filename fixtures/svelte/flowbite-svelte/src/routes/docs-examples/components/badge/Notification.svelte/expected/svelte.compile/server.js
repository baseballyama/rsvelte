import * as $ from 'svelte/internal/server';
import { Button, Indicator } from "flowbite-svelte";
import { EnvelopeSolid } from "flowbite-svelte-icons";

export default function Notification($$renderer) {
	Button($$renderer, {
		class: 'relative',
		size: 'sm',
		children: ($$renderer) => {
			EnvelopeSolid($$renderer, { class: 'text-white dark:text-white' });
			$$renderer.push(`<!----> <span class="sr-only">Notifications</span> `);

			Indicator($$renderer, {
				color: 'blue',
				border: true,
				size: 'xl',
				placement: 'top-right',
				class: 'text-xs font-bold',
				children: ($$renderer) => {
					$$renderer.push(`<!---->18`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'relative',
		size: 'sm',
		children: ($$renderer) => {
			EnvelopeSolid($$renderer, { class: 'text-white dark:text-white' });
			$$renderer.push(`<!----> <span class="sr-only">Notifications</span> `);

			Indicator($$renderer, {
				color: 'red',
				border: true,
				size: 'xl',
				placement: 'top-right',
				class: 'text-xs font-bold',
				children: ($$renderer) => {
					$$renderer.push(`<!---->20`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'relative',
		size: 'sm',
		children: ($$renderer) => {
			EnvelopeSolid($$renderer, { class: 'text-white dark:text-white' });
			$$renderer.push(`<!----> <span class="sr-only">Notifications</span> `);

			Indicator($$renderer, {
				color: 'gray',
				border: true,
				size: 'xl',
				placement: 'bottom-right',
				class: 'text-xs font-bold',
				children: ($$renderer) => {
					$$renderer.push(`<!---->20`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}