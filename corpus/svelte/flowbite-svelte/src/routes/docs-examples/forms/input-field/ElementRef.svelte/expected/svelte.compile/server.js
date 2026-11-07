import * as $ from 'svelte/internal/server';
import { Button, Modal, Input, Label } from "flowbite-svelte";

export default function ElementRef($$renderer) {
	let defaultModal = false;
	let elementRef = void 0;

	const handleClick = () => {
		defaultModal = true;
		elementRef?.focus();
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			onclick: handleClick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Default modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		{
			function header($$renderer) {
				$$renderer.push(`<!---->Form title`);
			}

			function footer($$renderer) {
				Button($$renderer, {
					onclick: () => alert("Handle submit"),
					children: ($$renderer) => {
						$$renderer.push(`<!---->Submit`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					color: 'alternative',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Cancel`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			Modal($$renderer, {
				dismissable: false,
				get open() {
					return defaultModal;
				},

				set open($$value) {
					defaultModal = $$value;
					$$settled = false;
				},
				header,
				footer,
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Totam cumque quisquam dolores doloribus. Aperiam perferendis quod ea repudiandae odit libero tempore error?</p> <form><div class="mb-6 grid gap-6 md:grid-cols-2"><div>`);

					Label($$renderer, {
						for: 'first_name',
						class: 'mb-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->First name`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						type: 'text',
						id: 'first_name',
						placeholder: 'John',
						required: true,
						get elementRef() {
							return elementRef;
						},

						set elementRef($$value) {
							elementRef = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div>`);

					Label($$renderer, {
						for: 'last_name',
						class: 'mb-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Last name`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						type: 'text',
						id: 'last_name',
						placeholder: 'Doe',
						required: true
					});

					$$renderer.push(`<!----></div> <div>`);

					Label($$renderer, {
						for: 'company',
						class: 'mb-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Company`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						type: 'text',
						id: 'company',
						placeholder: 'Flowbite',
						required: true
					});

					$$renderer.push(`<!----></div> <div>`);

					Label($$renderer, {
						for: 'phone',
						class: 'mb-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Phone number`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						type: 'tel',
						id: 'phone',
						placeholder: '123-45-678',
						pattern: "[0-9]{3}-[0-9]{2}-[0-9]{3}",
						required: true
					});

					$$renderer.push(`<!----></div></div></form>`);
				},
				$$slots: { header: true, footer: true, default: true }
			});
		}

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}