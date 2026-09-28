import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex flex-col gap-2 sm:gap-3"><div class="space-y-1.5"><h3 class="text-sm font-bold uppercase tracking-widest text-foreground"> </h3> <p class="text-sm text-muted-foreground"> </p></div> <form class="flex flex-row items-center gap-2"><!> <!></form></div>`);

export default function Newsletter($$anchor, $$props) {
	$.push($$props, true);

	let email = $.state('');
	let subscribing = $.state(false);
	const plugin = $.derived(() => page.data.store?.plugins?.newsletter);
	const klaviyoConfig = $.derived(() => resolveKlaviyoConfig(page.data.store?.plugins));
	const userState = getUserState();

	// Own submit instead of the renderer's subscribeToNewsletter: that one only fires a
	// toast and gives no success signal back, but a successful subscribe must land on
	// /subscription-success so the confirm-your-email instruction can't be missed.
	async function handleSubscribe() {
		const result = z.string().email().safeParse($.get(email));

		if (!result.success) {
			toast.error('Please enter a valid email address');

			return;
		}

		$.set(subscribing, true);

		try {
			// Litekart's own newsletter list (existing behavior).
			await storeService.post('/api/newsletter/subscribe', {
				email: $.get(email),
				customerId: userState?.user?.userId || null
			});

			// Klaviyo: attach the session to a profile, then subscribe it to the configured
			// list so flows/campaigns can email them. No-op when Klaviyo isn't configured.
			klaviyoIdentify({ email: $.get(email) });

			klaviyoSubscribe($.get(email), $.get(klaviyoConfig));
			goto('/subscription-success', { state: { email: $.get(email) } });
		} catch(e) {
			console.error('newsletter', e);
			toast.error(e?.message || 'Subscription failed, please try again');
		} finally {
			$.set(subscribing, false);
		}
	}

	{
		const content = ($$anchor, $$arg0) => {
			let loadingForSubmitting = () => ($$arg0?.()).loadingForSubmitting;
			var div = root();
			var div_1 = $.child(div);
			var h3 = $.child(div_1);
			var text = $.only_child(h3, true);
			var p = $.sibling(h3, 2);
			var text_1 = $.only_child(p, true);

			$.reset(div_1);

			var form = $.sibling(div_1, 2);
			var node = $.child(form);

			{
				let $0 = $.derived(() => $.get(plugin).placeholder || "Enter your email");

				Input(node, {
					type: 'email',
					'aria-label': 'Email address',
					get placeholder() {
						return $.get($0);
					},
					class: 'h-10 w-full min-w-0 flex-1 bg-background',
					required: true,
					get value() {
						return $.get(email);
					},

					set value($$value) {
						$.set(email, $$value, true);
					}
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => $.get(subscribing) || loadingForSubmitting());

				Button(node_1, {
					type: 'submit',
					class: 'ed-sub-btn h-10 shrink-0 px-5 sm:px-8',
					get disabled() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								var text_2 = $.text('Subscribing…');

								$.append($$anchor, text_2);
							};

							var alternate = ($$anchor) => {
								var text_3 = $.text('Subscribe');

								$.append($$anchor, text_3);
							};

							$.if(node_2, ($$render) => {
								if ($.get(subscribing)) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			}

			$.reset(form);
			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, $.get(plugin).heading || 'Newsletter');
				$.set_text(text_1, $.get(plugin).subheading || 'Subscribe to get the latest arrivals and offers.');
			});

			$.event('submit', form, (e) => {
				e.preventDefault();
				handleSubscribe();
			});

			$.append($$anchor, div);
		};

		NewsletterRenderer($$anchor, {
			get email() {
				return $.get(email);
			},

			set email($$value) {
				$.set(email, $$value, true);
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}