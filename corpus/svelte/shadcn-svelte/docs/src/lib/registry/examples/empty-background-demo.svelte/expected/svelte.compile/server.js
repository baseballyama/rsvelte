import * as $ from 'svelte/internal/server';
import RefreshCcwIcon from "@lucide/svelte/icons/refresh-ccw";
import BellIcon from "@tabler/icons-svelte/icons/bell";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Empty_background_demo($$renderer) {
	if (Empty.Root) {
		$$renderer.push('<!--[-->');

		Empty.Root($$renderer, {
			class: 'h-full bg-gradient-to-b from-muted/50 from-30% to-background',
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
										BellIcon($$renderer, {});
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
										$$renderer.push(`<!---->No Notifications`);
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
										$$renderer.push(`<!---->You're all caught up. New notifications will appear here.`);
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
									RefreshCcwIcon($$renderer, {});
									$$renderer.push(`<!----> Refresh`);
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