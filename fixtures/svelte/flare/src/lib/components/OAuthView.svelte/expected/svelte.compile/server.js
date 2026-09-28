import * as $ from 'svelte/internal/server';
import { ArrowLeft, Check } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import Icon from './Icon.svelte';

export default function OAuthView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			providerName,
			providerIcon,
			description,
			authUrl,
			status,
			onSignIn,
			onBack
		} = $$props;

		let isLinkCopied = false;

		function handleCopyLink() {
			writeText(authUrl);
			isLinkCopied = true;

			setTimeout(
				() => {
					isLinkCopied = false;
				},
				2000
			);
		}

		$$renderer.push(`<div class="flex h-screen flex-col items-center justify-center"><header class="absolute top-4 left-4">`);

		Button($$renderer, {
			variant: 'ghost',
			size: 'icon',
			class: 'rounded-full text-white/80',
			onclick: onBack,
			children: ($$renderer) => {
				ArrowLeft($$renderer, { class: 'size-5' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></header> <div class="flex flex-col items-center gap-4 text-center"><div class="relative mb-2 flex h-20 w-20 items-center justify-center"><div class="bg-background absolute z-10 flex size-12 items-center justify-center rounded-2xl border border-white/10">`);
		Icon($$renderer, { icon: 'raycast-logo-neg-16', class: 'size-7' });
		$$renderer.push(`<!----> `);

		if (status === 'success') {
			$$renderer.push(`<!--[0--><div class="border-background absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border-2 bg-green-500 text-white">`);
			Check($$renderer, { class: 'size-4' });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (providerIcon) {
			$$renderer.push(`<!--[0--><div class="absolute -right-3 bottom-1 z-0"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <h1 class="text-4xl font-bold text-white">${$.escape(providerName)}</h1> `);

		if (status === 'success') {
			$$renderer.push(`<!--[0--><p class="text-lg text-white/70">Successfully connected to ${$.escape(providerName)}</p>`);
		} else {
			$$renderer.push(`<!--[-1--><p class="text-lg text-white/70">${$.escape(description)}</p>`);
		}

		$$renderer.push(`<!--]--> `);

		if (status === 'initial') {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				class: 'mt-4 bg-white/10 px-8 py-3 text-base font-semibold text-white hover:bg-white/20',
				onclick: onSignIn,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Sign in with ${$.escape(providerName)}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (status === 'initial') {
			$$renderer.push(`<!--[0--><footer class="absolute bottom-8"><span class="text-sm text-white/50">Need to open in another browser? <button class="font-medium text-white/80 hover:underline">`);

			if (isLinkCopied) {
				$$renderer.push(`<!--[0-->Copied!`);
			} else {
				$$renderer.push(`<!--[-1-->Copy authorization link`);
			}

			$$renderer.push(`<!--]--></button></span></footer>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}