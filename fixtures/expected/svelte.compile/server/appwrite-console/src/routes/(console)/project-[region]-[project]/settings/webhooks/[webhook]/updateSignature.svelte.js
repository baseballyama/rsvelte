import * as $ from 'svelte/internal/server';
import { CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Alert, Link } from '@appwrite.io/pink-svelte';
import Regenerate from './regenerate.svelte';
import { Click, trackEvent } from '$lib/actions/analytics';

export default function UpdateSignature($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let showRegenerate = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Used to validate incoming webhook payloads with the \`X-Appwrite-Webhook-Signature\` header. `);

					if (Link.Anchor) {
						$$renderer.push('<!--[-->');

						Link.Anchor($$renderer, {
							href: 'https://appwrite.io/docs/advanced/platform/webhooks#verification',
							target: '_blank',
							rel: 'noopener noreferrer',
							class: 'link',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Learn more`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Webhook secret`);
						}
					},

					aside: ($$renderer) => {
						{
							if (Alert.Inline) {
								$$renderer.push('<!--[-->');

								Alert.Inline($$renderer, {
									status: 'info',
									children: ($$renderer) => {
										$$renderer.push(`<!---->This secret is only shown once after webhook creation or secret rotation.`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								submit: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Rotate secret`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			Regenerate($$renderer, {
				get show() {
					return showRegenerate;
				},

				set show($$value) {
					showRegenerate = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}