import * as $ from 'svelte/internal/server';

import {
	Avatar,
	Drawer,
	CardPlaceholder,
	Button,
	Label,
	Input,
	Textarea
} from "flowbite-svelte";

import { InfoCircleSolid, UserAddOutline, CalendarEditSolid } from "flowbite-svelte-icons";

export default function Form($$renderer) {
	let open4 = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="text-center">`);

		Button($$renderer, {
			onclick: () => open4 = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show drawer form`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		CardPlaceholder($$renderer, { size: '2xl', class: 'mt-6' });
		$$renderer.push(`<!----></div> `);

		Drawer($$renderer, {
			form: true,
			classes: { form: "space-y-6 mb-6" },
			get open() {
				return open4;
			},

			set open($$value) {
				open4 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<h5 class="mb-6 inline-flex items-center text-base font-semibold text-gray-500 uppercase dark:text-gray-400">`);
				InfoCircleSolid($$renderer, { class: 'me-2.5 h-5 w-5' });
				$$renderer.push(`<!---->New event</h5> `);

				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Title `);

						Input($$renderer, {
							name: 'title',
							class: 'mt-2',
							required: true,
							placeholder: 'Apple Keynote'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Description `);

						Textarea($$renderer, {
							placeholder: 'Write event description...',
							rows: 4,
							name: 'message',
							class: 'mt-2 w-full font-normal'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Input($$renderer, { name: 'date', required: true, type: 'date' });
				$$renderer.push(`<!----> `);

				{
					function right($$renderer) {
						Button($$renderer, {
							size: 'xs',
							children: ($$renderer) => {
								UserAddOutline($$renderer, { class: 'me-1.5 h-4 w-4 text-white' });
								$$renderer.push(`<!---->Add`);
							},
							$$slots: { default: true }
						});
					}

					Input($$renderer, {
						placeholder: 'Add guest email',
						right,
						$$slots: { right: true }
					});
				}

				$$renderer.push(`<!----> <div class="mb-4 flex">`);

				Avatar($$renderer, {
					src: '/images/profile-picture-1.webp',
					stacked: true,
					size: 'sm'
				});

				$$renderer.push(`<!----> `);

				Avatar($$renderer, {
					src: '/images/profile-picture-2.webp',
					stacked: true,
					size: 'sm'
				});

				$$renderer.push(`<!----> `);

				Avatar($$renderer, {
					src: '/images/profile-picture-3.webp',
					stacked: true,
					size: 'sm'
				});

				$$renderer.push(`<!----> `);

				Avatar($$renderer, {
					src: '/images/profile-picture-4.webp',
					stacked: true,
					size: 'sm'
				});

				$$renderer.push(`<!----></div> `);

				Button($$renderer, {
					type: 'submit',
					class: 'w-full',
					children: ($$renderer) => {
						CalendarEditSolid($$renderer, { class: 'me-2.5 h-3.5 w-3.5 text-white' });
						$$renderer.push(`<!----> Create event`);
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