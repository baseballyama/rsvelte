import * as $ from 'svelte/internal/server';
import * as Accordion from "$lib/registry/ui/accordion/index.js";

export default function Accordion_demo($$renderer) {
	if (Accordion.Root) {
		$$renderer.push('<!--[-->');

		Accordion.Root($$renderer, {
			type: 'single',
			class: 'w-full sm:max-w-[70%]',
			value: 'item-1',
			children: ($$renderer) => {
				if (Accordion.Item) {
					$$renderer.push('<!--[-->');

					Accordion.Item($$renderer, {
						value: 'item-1',
						children: ($$renderer) => {
							if (Accordion.Trigger) {
								$$renderer.push('<!--[-->');

								Accordion.Trigger($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Product Information`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Accordion.Content) {
								$$renderer.push('<!--[-->');

								Accordion.Content($$renderer, {
									class: 'flex flex-col gap-4 text-balance',
									children: ($$renderer) => {
										$$renderer.push(`<p>Our flagship product combines cutting-edge technology with sleek design. Built with premium
				materials, it offers unparalleled performance and reliability.</p> <p>Key features include advanced processing capabilities, and an intuitive user interface
				designed for both beginners and experts.</p>`);
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
							if (Accordion.Trigger) {
								$$renderer.push('<!--[-->');

								Accordion.Trigger($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Shipping Details`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Accordion.Content) {
								$$renderer.push('<!--[-->');

								Accordion.Content($$renderer, {
									class: 'flex flex-col gap-4 text-balance',
									children: ($$renderer) => {
										$$renderer.push(`<p>We offer worldwide shipping through trusted courier partners. Standard delivery takes 3-5
				business days, while express shipping ensures delivery within 1-2 business days.</p> <p>All orders are carefully packaged and fully insured. Track your shipment in real-time
				through our dedicated tracking portal.</p>`);
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
							if (Accordion.Trigger) {
								$$renderer.push('<!--[-->');

								Accordion.Trigger($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Return Policy`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Accordion.Content) {
								$$renderer.push('<!--[-->');

								Accordion.Content($$renderer, {
									class: 'flex flex-col gap-4 text-balance',
									children: ($$renderer) => {
										$$renderer.push(`<p>We stand behind our products with a comprehensive 30-day return policy. If you're not
				completely satisfied, simply return the item in its original condition.</p> <p>Our hassle-free return process includes free return shipping and full refunds processed
				within 48 hours of receiving the returned item.</p>`);
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

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}