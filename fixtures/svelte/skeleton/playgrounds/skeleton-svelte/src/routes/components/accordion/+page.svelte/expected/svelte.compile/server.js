import * as $ from 'svelte/internal/server';
import { Accordion } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	Accordion($$renderer, {
		children: ($$renderer) => {
			if (Accordion.Item) {
				$$renderer.push('<!--[-->');

				Accordion.Item($$renderer, {
					value: 'item-1',
					children: ($$renderer) => {
						$$renderer.push(`<h3>`);

						if (Accordion.ItemTrigger) {
							$$renderer.push('<!--[-->');

							Accordion.ItemTrigger($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Item 1`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</h3> `);

						if (Accordion.ItemContent) {
							$$renderer.push('<!--[-->');

							Accordion.ItemContent($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Content 1`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Accordion.Item) {
				$$renderer.push('<!--[-->');

				Accordion.Item($$renderer, {
					value: 'item-2',
					children: ($$renderer) => {
						$$renderer.push(`<h3>`);

						if (Accordion.ItemTrigger) {
							$$renderer.push('<!--[-->');

							Accordion.ItemTrigger($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Item 2`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</h3> `);

						if (Accordion.ItemContent) {
							$$renderer.push('<!--[-->');

							Accordion.ItemContent($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Content 2`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Accordion.Item) {
				$$renderer.push('<!--[-->');

				Accordion.Item($$renderer, {
					value: 'item-3',
					children: ($$renderer) => {
						$$renderer.push(`<h3>`);

						if (Accordion.ItemTrigger) {
							$$renderer.push('<!--[-->');

							Accordion.ItemTrigger($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Item 3`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</h3> `);

						if (Accordion.ItemContent) {
							$$renderer.push('<!--[-->');

							Accordion.ItemContent($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Content 3`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}