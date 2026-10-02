import * as $ from 'svelte/internal/server';
import Button from '../ui/button/button.svelte';
import Input from '../ui/input/input.svelte';
import { NewsletterRenderer } from '$lib/core/composables/index.js';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { toast } from '@misiki/kitcommerce-core';
import { z } from 'zod';
import { storeService } from '$lib/core/services';
import { getUserState } from '$lib/core/stores/index.js';
import { klaviyoIdentify, klaviyoSubscribe, resolveKlaviyoConfig } from '$lib/klaviyo';

export default function Newsletter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let email = '';
		let subscribing = false;
		const plugin = $.derived(() => page.data.store?.plugins?.newsletter);
		const klaviyoConfig = $.derived(() => resolveKlaviyoConfig(page.data.store?.plugins));
		const userState = getUserState();

		// Own submit instead of the renderer's subscribeToNewsletter: that one only fires a
		// toast and gives no success signal back, but a successful subscribe must land on
		// /subscription-success so the confirm-your-email instruction can't be missed.
		async function handleSubscribe() {
			const result = z.string().email().safeParse(email);

			if (!result.success) {
				toast.error('Please enter a valid email address');

				return;
			}

			subscribing = true;

			try {
				// Litekart's own newsletter list (existing behavior).
				await storeService.post('/api/newsletter/subscribe', { email, customerId: userState?.user?.userId || null });

				// Klaviyo: attach the session to a profile, then subscribe it to the configured
				// list so flows/campaigns can email them. No-op when Klaviyo isn't configured.
				klaviyoIdentify({ email });

				klaviyoSubscribe(email, klaviyoConfig());
				goto('/subscription-success', { state: { email } });
			} catch(e) {
				console.error('newsletter', e);
				toast.error(e?.message || 'Subscription failed, please try again');
			} finally {
				subscribing = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function content($$renderer, { loadingForSubmitting }) {
					$$renderer.push(`<div class="flex flex-col gap-2 sm:gap-3"><div class="space-y-1.5"><h3 class="text-sm font-bold uppercase tracking-widest text-foreground">${$.escape(plugin().heading || 'Newsletter')}</h3> <p class="text-sm text-muted-foreground">${$.escape(plugin().subheading || 'Subscribe to get the latest arrivals and offers.')}</p></div> <form class="flex flex-row items-center gap-2">`);

					Input($$renderer, {
						type: 'email',
						'aria-label': 'Email address',
						placeholder: plugin().placeholder || "Enter your email",
						class: 'h-10 w-full min-w-0 flex-1 bg-background',
						required: true,
						get value() {
							return email;
						},

						set value($$value) {
							email = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						type: 'submit',
						class: 'ed-sub-btn h-10 shrink-0 px-5 sm:px-8',
						disabled: subscribing || loadingForSubmitting,
						children: ($$renderer) => {
							if (subscribing) {
								$$renderer.push(`<!--[0-->Subscribing…`);
							} else {
								$$renderer.push(`<!--[-1-->Subscribe`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></form></div>`);
				}

				NewsletterRenderer($$renderer, {
					get email() {
						return email;
					},

					set email($$value) {
						email = $$value;
						$$settled = false;
					},
					content,
					$$slots: { content: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}