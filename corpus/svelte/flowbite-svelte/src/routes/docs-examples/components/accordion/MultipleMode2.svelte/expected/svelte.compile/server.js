import * as $ from 'svelte/internal/server';
import { AccordionItem, Accordion, Button, P } from "flowbite-svelte";

export default function MultipleMode2($$renderer) {
	const items = [false, false, false];
	const open_all = () => items.forEach((_, i) => items[i] = true);
	const close_all = () => items.forEach((_, i) => items[i] = false);
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			onclick: open_all,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open all`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: close_all,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Close all`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Accordion($$renderer, {
			multiple: true,
			children: ($$renderer) => {
				{
					function header($$renderer) {
						$$renderer.push(`<!---->My Header 1`);
					}

					AccordionItem($$renderer, {
						get open() {
							return items[0];
						},

						set open($$value) {
							items[0] = $$value;
							$$settled = false;
						},
						header,
						children: ($$renderer) => {
							P($$renderer, {
								class: 'mb-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							P($$renderer, {
								class: 'text-gray-500 dark:text-gray-400',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Check out this guide to learn how to <a href="/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline dark:text-blue-500">get started</a> and start developing websites even faster with components on top of Tailwind CSS.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
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
						get open() {
							return items[1];
						},

						set open($$value) {
							items[1] = $$value;
							$$settled = false;
						},
						header,
						children: ($$renderer) => {
							P($$renderer, {
								class: 'mb-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							P($$renderer, {
								class: 'mb-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							P($$renderer, {
								class: 'mb-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Learn more about these technologies:`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { header: true, default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function header($$renderer) {
						$$renderer.push(`<!---->My Header 3`);
					}

					AccordionItem($$renderer, {
						get open() {
							return items[2];
						},

						set open($$value) {
							items[2] = $$value;
							$$settled = false;
						},
						header,
						children: ($$renderer) => {
							P($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Something more`);
								},
								$$slots: { default: true }
							});
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
}