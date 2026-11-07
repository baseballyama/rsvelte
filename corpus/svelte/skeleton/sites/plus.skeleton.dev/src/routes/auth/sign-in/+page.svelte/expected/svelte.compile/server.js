import * as $ from 'svelte/internal/server';
import { supportedOAuthProviders } from '$lib/auth/supported-oauth-providers';
import SignInButton from '$lib/components/auth/sign-in-button.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="space-y-6 text-center"><header class="space-y-2"><h1 class="h2">Sign In</h1> <p class="opacity-60">Choose a service and sign in to Skeleton Plus.</p></header> <div class="grid grid-cols-1 items-center gap-2"><!--[-->`);

	const each_array = $.ensure_array_like(supportedOAuthProviders);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let provider = each_array[$$index];

		SignInButton($$renderer, {
			providerId: provider.id,
			class: 'btn btn-lg preset-filled w-full max-w-xs',
			children: ($$renderer) => {
				if (provider.Icon) {
					$$renderer.push('<!--[-->');
					provider.Icon($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <span>${$.escape(provider.name)}</span>`);
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]--></div></div>`);
}