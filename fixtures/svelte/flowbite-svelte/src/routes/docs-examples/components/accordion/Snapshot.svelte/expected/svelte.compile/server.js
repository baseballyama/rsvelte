import * as $ from 'svelte/internal/server';
import { AccordionItem, Accordion, Input, Textarea, Button, Label, A } from "flowbite-svelte";

export default function Snapshot($$renderer, $$props) {
	let name = "";
	let email = "";
	let comment = "";

	const snapshot = {
		capture: () => ({ name, email, comment }),
		restore: (value) => {
			name = value.name;
			email = value.email;
			comment = value.comment;
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		alert(`Submitted:\nName: ${name}\nEmail: ${email}\nComment: ${comment}`);
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		A($$renderer, {
			href: '/',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Go home`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Accordion($$renderer, {
			children: ($$renderer) => {
				{
					function header($$renderer) {
						$$renderer.push(`<!---->My Header 1`);
					}

					AccordionItem($$renderer, {
						header,
						children: ($$renderer) => {
							$$renderer.push(`<form method="POST">`);

							Label($$renderer, {
								for: 'name',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Name`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Input($$renderer, {
								id: 'name',
								type: 'text',
								get value() {
									return name;
								},

								set value($$value) {
									name = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Label($$renderer, {
								for: 'email',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Email`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Input($$renderer, {
								id: 'email',
								type: 'email',
								get value() {
									return email;
								},

								set value($$value) {
									email = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Label($$renderer, {
								for: 'comment',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Comment`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Textarea($$renderer, {
								id: 'comment',
								class: 'w-full',
								get value() {
									return comment;
								},

								set value($$value) {
									comment = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								onclick: handleSubmit,
								class: 'mt-4',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Submit`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></form>`);
						},
						$$slots: { header: true, default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function header($$renderer) {
						$$renderer.push(`<!---->My Header 2`);
					}

					AccordionItem($$renderer, {
						header,
						children: ($$renderer) => {
							$$renderer.push(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p> <ul class="list-disc ps-5 text-gray-500 dark:text-gray-400"><li><a href="/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline dark:text-blue-500">Lorem ipsum</a></li> <li><a href="https://tailwindui.com/" rel="noreferrer" target="_blank" class="text-blue-600 hover:underline dark:text-blue-500">Tailwind UI</a></li></ul>`);
						},
						$$slots: { header: true, default: true }
					});
				}

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
	$.bind_props($$props, { snapshot });
}