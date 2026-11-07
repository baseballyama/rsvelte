import * as $ from 'svelte/internal/server';

import {
	Drawer,
	CardPlaceholder,
	Button,
	Label,
	Input,
	Textarea,
	P,
	A
} from "flowbite-svelte";

import { InfoCircleSolid } from "flowbite-svelte-icons";

export default function Contact($$renderer) {
	let open3 = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="text-center">`);

		Button($$renderer, {
			onclick: () => open3 = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show contact form`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		CardPlaceholder($$renderer, { size: '2xl', class: 'mt-6' });
		$$renderer.push(`<!----></div> `);

		Drawer($$renderer, {
			get open() {
				return open3;
			},

			set open($$value) {
				open3 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<h5 class="mb-6 inline-flex items-center text-base font-semibold text-gray-500 uppercase dark:text-gray-400">`);
				InfoCircleSolid($$renderer, { class: 'me-2.5 h-5 w-5' });
				$$renderer.push(`<!---->Contact us</h5> <form method="dialog" class="mb-6"><div class="mb-6">`);

				Label($$renderer, {
					for: 'email',
					class: 'mb-2 block',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Your email`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					id: 'email',
					name: 'email',
					required: true,
					placeholder: 'name@company.com'
				});

				$$renderer.push(`<!----></div> <div class="mb-6">`);

				Label($$renderer, {
					for: 'subject',
					class: 'mb-2 block',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Subject`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					id: 'subject',
					name: 'subject',
					required: true,
					placeholder: 'Let us know how we can help you'
				});

				$$renderer.push(`<!----></div> <div class="mb-6">`);

				Label($$renderer, {
					for: 'message',
					class: 'mb-2',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Your message`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Textarea($$renderer, {
					id: 'message',
					placeholder: 'Your message...',
					rows: 4,
					name: 'message',
					class: 'w-full'
				});

				$$renderer.push(`<!----></div> `);

				Button($$renderer, {
					type: 'submit',
					class: 'w-full',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Send message`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></form> `);

				P($$renderer, {
					class: 'mb-2 text-sm text-gray-500 dark:text-gray-400',
					children: ($$renderer) => {
						A($$renderer, {
							href: '/',
							class: 'text-primary-600 dark:text-primary-500 hover:underline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->info@company.com`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				P($$renderer, {
					class: 'text-sm text-gray-500 dark:text-gray-400',
					children: ($$renderer) => {
						A($$renderer, {
							href: '/',
							class: 'text-primary-600 dark:text-primary-500 hover:underline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->212-456-7890`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}