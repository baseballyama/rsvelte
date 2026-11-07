import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { Unauthenticated } from '$lib/layout';
import { Button } from '$lib/elements/forms';
import { Badge, Typography, Layout } from '@appwrite.io/pink-svelte';

export default function _error($$renderer) {
	Unauthenticated($$renderer, {
		children: ($$renderer) => {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 'l',
					alignItems: 'center',
					children: ($$renderer) => {
						Badge($$renderer, { variant: 'secondary', content: '404 Page not found' });
						$$renderer.push(`<!----> `);

						if (Typography.Title) {
							$$renderer.push('<!--[-->');

							Typography.Title($$renderer, {
								size: 'l',
								align: 'center',
								children: ($$renderer) => {
									$$renderer.push(`<!---->The page you're looking for doesn't exist.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						Button($$renderer, {
							href: base,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Back to console`);
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
}