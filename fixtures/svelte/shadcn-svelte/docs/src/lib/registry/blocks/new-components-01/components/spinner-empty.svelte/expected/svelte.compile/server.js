import * as $ from 'svelte/internal/server';
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Spinner_empty($$renderer) {
	if (Empty.Root) {
		$$renderer.push('<!--[-->');

		Empty.Root($$renderer, {
			class: 'w-full',
			children: ($$renderer) => {
				if (Empty.Header) {
					$$renderer.push('<!--[-->');

					Empty.Header($$renderer, {
						children: ($$renderer) => {
							if (Empty.Media) {
								$$renderer.push('<!--[-->');

								Empty.Media($$renderer, {
									variant: 'icon',
									children: ($$renderer) => {
										Spinner($$renderer, {});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Empty.Title) {
								$$renderer.push('<!--[-->');

								Empty.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Processing your request`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Empty.Description) {
								$$renderer.push('<!--[-->');

								Empty.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Please wait while we process your request. Do not refresh the page.`);
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

				if (Empty.Content) {
					$$renderer.push('<!--[-->');

					Empty.Content($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});
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