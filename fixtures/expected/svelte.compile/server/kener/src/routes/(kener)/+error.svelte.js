import * as $ from 'svelte/internal/server';
import { page } from "$app/stores";
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import Home from "@lucide/svelte/icons/home";
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import AlertCircle from "@lucide/svelte/icons/alert-circle";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<div class="flex min-h-[60vh] items-center justify-center p-4">`);

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				class: 'w-full max-w-md rounded-3xl border bg-transparent shadow-none',
				children: ($$renderer) => {
					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'flex flex-col items-center gap-6 pt-10 pb-8 text-center',
							children: ($$renderer) => {
								$$renderer.push(`<div class="bg-muted flex size-16 items-center justify-center rounded-full">`);
								AlertCircle($$renderer, { class: 'text-muted-foreground size-8' });
								$$renderer.push(`<!----></div> <div class="space-y-2"><h1 class="text-4xl font-bold">${$.escape($.store_get($$store_subs ??= {}, '$page', page).status)}</h1> <p class="text-muted-foreground text-lg">`);

								if ($.store_get($$store_subs ??= {}, '$page', page).error?.message) {
									$$renderer.push(`<!--[0-->${$.escape($.store_get($$store_subs ??= {}, '$page', page).error.message)}`);
								} else if ($.store_get($$store_subs ??= {}, '$page', page).status === 404) {
									$$renderer.push(`<!--[1-->The page you're looking for doesn't exist or has been moved.`);
								} else if ($.store_get($$store_subs ??= {}, '$page', page).status === 500) {
									$$renderer.push(`<!--[2-->Something went wrong on our end. Please try again later.`);
								} else {
									$$renderer.push(`<!--[-1-->An unexpected error occurred.`);
								}

								$$renderer.push(`<!--]--></p></div> <div class="flex gap-3">`);

								Button($$renderer, {
									variant: 'outline',
									onclick: () => history.back(),
									class: 'rounded-full',
									children: ($$renderer) => {
										ArrowLeft($$renderer, { class: 'mr-2 size-4' });
										$$renderer.push(`<!----> Go Back`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									href: clientResolver(resolve, "/"),
									class: 'rounded-full',
									children: ($$renderer) => {
										Home($$renderer, { class: 'mr-2 size-4' });
										$$renderer.push(`<!----> Home`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
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

		$$renderer.push(`</div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}