import * as $ from 'svelte/internal/server';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Card_with_image($$renderer) {
	Example($$renderer, {
		title: 'With Image',
		children: ($$renderer) => {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					size: 'default',
					class: 'relative mx-auto w-full max-w-sm pt-0',
					children: ($$renderer) => {
						$$renderer.push(`<div class="inse.t-0 absolute z-30 aspect-video bg-primary opacity-50 mix-blend-color"></div> <img src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&amp;w=1887&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="by mymind on Unsplash" class="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"/> `);

						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Beautiful Landscape`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Card.Description) {
										$$renderer.push('<!--[-->');

										Card.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->A stunning view that captures the essence of natural beauty.`);
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

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								children: ($$renderer) => {
									if (Button.Root) {
										$$renderer.push('<!--[-->');

										Button.Root($$renderer, {
											class: 'w-full',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'PlusIcon',
													tabler: 'IconPlus',
													hugeicons: 'Add01Icon',
													phosphor: 'PlusIcon',
													remixicon: 'RiAddLine',
													'data-icon': 'inline-start'
												});

												$$renderer.push(`<!----> Button`);
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
		},
		$$slots: { default: true }
	});
}