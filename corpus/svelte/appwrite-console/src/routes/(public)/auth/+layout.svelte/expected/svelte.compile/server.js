import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { app } from '$lib/stores/app';
import { loading } from '$routes/store';
import { Typography } from '@appwrite.io/pink-svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		loading.set(false);
		$$renderer.push(`<div class="auth-bg svelte-10szmjl"><section class="svelte-10szmjl"><div class="console-container"><!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--></div></section> <footer class="svelte-10szmjl">`);

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

		$$renderer.push(`<!--]--></footer></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}