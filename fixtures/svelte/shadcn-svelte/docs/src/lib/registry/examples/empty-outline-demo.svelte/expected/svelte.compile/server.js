import * as $ from 'svelte/internal/server';
import CloudIcon from "@tabler/icons-svelte/icons/cloud";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Empty_outline_demo($$renderer) {
	if (Empty.Root) {
		$$renderer.push('<!--[-->');

		Empty.Root($$renderer, {
			class: 'border border-dashed',
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
										CloudIcon($$renderer, {});
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
										$$renderer.push(`<!---->Cloud Storage Empty`);
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
										$$renderer.push(`<!---->Upload files to your cloud storage to access them anywhere.`);
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
									$$renderer.push(`<!---->Upload Files`);
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