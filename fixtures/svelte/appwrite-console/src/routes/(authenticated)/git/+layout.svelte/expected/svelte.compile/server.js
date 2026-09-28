import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { loading } from '$routes/store';
import { app } from '$lib/stores/app';
import { Layout, Typography } from '@appwrite.io/pink-svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		loading.set(false);

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				height: '100vh',
				direction: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				style: 'background: var(--bgcolor-neutral-primary, #fff);',
				children: ($$renderer) => {
					$$renderer.push(`<section class="console-container svelte-18wxjgz"><!--[-->`);
					$.slot($$renderer, $$props, 'default', {}, null);
					$$renderer.push(`<!--]--></section> <footer class="svelte-18wxjgz">`);

					if (Typography.Eyebrow) {
						$$renderer.push('<!--[-->');

						Typography.Eyebrow($$renderer, {
							color: '--fgcolor-neutral-secondary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->POWERED BY`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if ($.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark') {
						$$renderer.push(`<!--[0--><img${$.attr('src', `${$.stringify(base)}/images/appwrite-logo-dark.svg`)} width="120" height="22" alt="Appwrite Logo"/>`);
					} else {
						$$renderer.push(`<!--[-1--><img${$.attr('src', `${$.stringify(base)}/images/appwrite-logo-light.svg`)} width="120" height="22" alt="Appwrite Logo"/>`);
					}

					$$renderer.push(`<!--]--></footer>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}