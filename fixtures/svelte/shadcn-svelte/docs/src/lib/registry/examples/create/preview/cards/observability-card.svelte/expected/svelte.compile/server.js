import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Observability_card($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			class: 'relative w-full max-w-md overflow-hidden pt-0',
			children: ($$renderer) => {
				$$renderer.push(`<div class="absolute inset-0 z-30 aspect-video bg-primary opacity-50 mix-blend-color"></div> <img src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&amp;w=1887&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" title="Photo by mymind on Unsplash" class="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"/> `);

				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Observability Plus is replacing Monitoring`);
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
										$$renderer.push(`<!---->Switch to the improved way to explore your data, with natural language. Monitoring will no
			longer be available on the Pro plan in November, 2025`);
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
							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Create Query `);

									IconPlaceholder($$renderer, {
										lucide: 'PlusIcon',
										tabler: 'IconPlus',
										hugeicons: 'PlusSignIcon',
										phosphor: 'PlusIcon',
										remixicon: 'RiAddLine',
										'data-icon': 'inline-end'
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Badge($$renderer, {
								variant: 'secondary',
								class: 'ml-auto',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Warning`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
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