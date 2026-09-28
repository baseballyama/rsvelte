import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { fly, fade } from 'svelte/transition';
import { MessageCircle, X, Send, Sparkles, Truck, Clock } from '@lucide/svelte';
import { toast } from 'svelte-sonner';
import { getCartState } from '$lib/core/stores/index.js';
import { formatPrice } from '$lib/core/utils';
import { assistantService } from '$lib/services/assistant-service';

export default function Conversational_shopping($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let enabled = false;
		let input = '';
		let loading = false;
		let sessionId = null;
		let messages = [];
		let listEl = null;
		let adding = null;
		const cartState = getCartState();
		const STORAGE_KEY = 'assistant_conversation_id';

		const initialChips = [
			'My marriage day is 01-Aug. Suggest me diamond rings.',
			'What is your budget?',
			'Preferred metal?',
			'Ring size?',
			'Delivery location?'
		];

		const currentChips = $.derived(() => {
			const last = messages[messages.length - 1];

			if (last?.nextQuestion?.options?.length) {
				return last.nextQuestion.options.map((o) => o.value);
			}

			return messages.length === 0 ? initialChips : [];
		});

		async function ensureSession() {
			if (sessionId) return sessionId;

			const existing = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
			const session = await assistantService.createSession(existing ?? undefined);

			sessionId = session.sessionId;

			if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, session.sessionId);

			return session.sessionId;
		}

		async function scrollToBottom() {
			await Promise.resolve();

			if (listEl) listEl.scrollTop = listEl.scrollHeight;
		}

		async function send(text) {
			const message = text.trim();

			if (!message || loading) return;

			input = '';
			messages = [...messages, { role: 'user', text: message }];
			loading = true;
			scrollToBottom();

			try {
				const id = await ensureSession();
				const res = await assistantService.sendMessage(id, message);

				messages = [
					...messages,
					{
						role: 'assistant',
						text: res.message,
						recommendations: res.recommendations,
						nextQuestion: res.nextQuestion
					}
				];

				if (res.recommendations?.length) {
					assistantService.postEvent(id, { type: 'assistant_products_shown' }).catch(() => {});
				}
			} catch {
				messages = [
					...messages,
					{
						role: 'assistant',
						text: 'Sorry — I had trouble just now. Please try again.'
					}
				];
			} finally {
				loading = false;
				scrollToBottom();
			}
		}

		async function addToCart(rec) {
			if (!sessionId || !rec.variantId || adding) return;

			adding = rec.productId;

			try {
				// Revalidate server-side before mutating the cart (price/stock/visibility).
				const result = await assistantService.addToCart(sessionId, { productId: rec.productId, variantId: rec.variantId, qty: 1 });

				if (!result.valid) {
					toast.error(result.reason ?? 'This item is no longer available.');

					return;
				}

				if (!cartState) {
					toast.error('Could not add to cart. Please open the product page.');

					return;
				}

				await cartState.add({ productId: rec.productId, variantId: rec.variantId, qty: 1 });
				assistantService.postEvent(sessionId, { type: 'assistant_add_to_cart', productId: rec.productId }).catch(() => {});
				toast.success('Added to cart');
			} catch {
				toast.error('Could not add to cart. Please open the product page.');
			} finally {
				adding = null;
			}
		}

		function formatDate(iso) {
			if (!iso) return '';

			const [y, m, d] = iso.split('-').map(Number);

			try {
				return new Intl.DateTimeFormat('en-GB', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
					timeZone: 'UTC'
				}).format(new Date(Date.UTC(y, m - 1, d)));
			} catch {
				return iso;
			}
		}

		function deliveryLine(rec) {
			const d = rec.delivery;

			if (!d.eligible) return `May not arrive${d.eventDate ? ` before ${formatDate(d.eventDate)}` : ''}`;
			if (d.confidence === 'guaranteed') return `Guaranteed by ${formatDate(d.estimatedDeliveryDate)}`;

			return `Estimated delivery ${formatDate(d.estimatedDeliveryDate)}`;
		}

		function fulfilmentLabel(rec) {
			if (rec.isAlternative) return 'Alternative';

			return rec.fulfillment === 'ready_to_ship' ? 'Ready to ship' : 'Made to order';
		}

		onMount(async () => {
			if (typeof localStorage !== 'undefined') {
				sessionId = localStorage.getItem(STORAGE_KEY);
			}

			// Gate the widget on the store's admin toggle (kitcommerce-admin).
			const config = await assistantService.getConfig();

			enabled = config.enabled;
		});

		function toggle() {
			open = !open;

			if (open && sessionId) assistantService.postEvent(sessionId, { type: 'assistant_opened' }).catch(() => {});
		}

		if (enabled) {
			$$renderer.push(`<!--[0--><button type="button" class="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-z-10 transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"${$.attr('aria-label', open
				? 'Close shopping assistant'
				: 'Open shopping assistant')}${$.attr('aria-expanded', open)}>`);

			if (open) {
				$$renderer.push('<!--[0-->');
				X($$renderer, { class: 'h-6 w-6', 'aria-hidden': 'true' });
			} else {
				$$renderer.push('<!--[-1-->');
				MessageCircle($$renderer, { class: 'h-6 w-6', 'aria-hidden': 'true' });
			}

			$$renderer.push(`<!--]--></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (enabled && open) {
			$$renderer.push(`<!--[0--><button type="button" class="fixed inset-0 z-40 bg-black/30 md:hidden" aria-label="Close shopping assistant"></button> <section class="fixed bottom-0 right-0 z-40 flex h-[85vh] w-full flex-col overflow-hidden rounded-t-radius border border-border bg-card text-card-foreground shadow-z-10 md:bottom-24 md:right-5 md:h-[600px] md:w-[400px] md:rounded-radius" role="dialog" aria-modal="true" aria-label="Shopping assistant"><header class="flex items-center justify-between border-b border-border px-4 py-3"><div class="flex items-center gap-2">`);
			Sparkles($$renderer, { class: 'h-5 w-5 text-primary', 'aria-hidden': 'true' });
			$$renderer.push(`<!----> <div><h2 class="font-heading text-sm font-semibold leading-tight">Find the perfect ring for your special day</h2> <p class="text-xxs text-muted-foreground">Tell me what you're looking for, and I'll help you find the right ring.</p></div></div> <button type="button" class="rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Close">`);
			X($$renderer, { class: 'h-5 w-5', 'aria-hidden': 'true' });
			$$renderer.push(`<!----></button></header> <div class="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-label="Conversation">`);

			if (messages.length === 0) {
				$$renderer.push(`<!--[0--><p class="text-sm text-muted-foreground">Try: “My marriage day is 01-Aug. Suggest me diamond rings.”</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array = $.ensure_array_like(messages);

			for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
				let msg = each_array[$$index_2];

				$$renderer.push(`<div${$.attr_class(`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`)}><div${$.attr_class(`max-w-[85%] rounded-radius px-3 py-2 text-sm ${msg.role === 'user'
					? 'bg-primary text-primary-foreground'
					: 'bg-muted text-foreground'}`)}>${$.escape(msg.text)}</div></div> `);

				if (msg.recommendations?.length) {
					$$renderer.push(`<!--[0--><div class="space-y-3"><!--[-->`);

					const each_array_1 = $.ensure_array_like(msg.recommendations);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let rec = each_array_1[$$index_1];

						$$renderer.push(`<article class="overflow-hidden rounded-radius border border-border bg-background"><div class="flex gap-3 p-3">`);

						if (rec.image) {
							$$renderer.push(`<!--[0--><img${$.attr('src', rec.image)}${$.attr('alt', rec.title)} class="h-20 w-20 flex-shrink-0 rounded object-cover" loading="lazy"/>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-2"><h3 class="truncate text-sm font-medium">${$.escape(rec.title)}</h3> <span${$.attr_class(`whitespace-nowrap rounded-full px-2 py-0.5 text-xxs ${rec.isAlternative
							? 'bg-accent text-accent-foreground'
							: 'bg-secondary text-secondary-foreground'}`)}>${$.escape(fulfilmentLabel(rec))}</span></div> <p class="mt-0.5 text-sm font-semibold">${$.escape(formatPrice(rec.price, rec.currency))}</p> `);

						if (rec.metal || rec.diamond || rec.certification) {
							$$renderer.push(`<!--[0--><p class="mt-0.5 text-xxs text-muted-foreground">${$.escape([rec.metal, rec.diamond, rec.certification].filter(Boolean).join(' · '))}</p>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <p class="mt-1 flex items-center gap-1 text-xxs text-muted-foreground">`);

						if (rec.fulfillment === 'ready_to_ship') {
							$$renderer.push('<!--[0-->');
							Truck($$renderer, { class: 'h-3 w-3', 'aria-hidden': 'true' });
						} else {
							$$renderer.push('<!--[-1-->');
							Clock($$renderer, { class: 'h-3 w-3', 'aria-hidden': 'true' });
						}

						$$renderer.push(`<!--]--> ${$.escape(deliveryLine(rec))}</p></div></div> `);

						if (rec.reasons?.length) {
							$$renderer.push(`<!--[0--><ul class="border-t border-border px-3 py-2 text-xxs text-muted-foreground"><!--[-->`);

							const each_array_2 = $.ensure_array_like(rec.reasons.slice(0, 2));

							for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
								let reason = each_array_2[$$index];

								$$renderer.push(`<li class="flex gap-1"><span aria-hidden="true">•</span> <span>${$.escape(reason)}</span></li>`);
							}

							$$renderer.push(`<!--]--></ul>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div class="flex gap-2 border-t border-border p-2"><button type="button" class="flex-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"${$.attr('disabled', !rec.variantId || adding === rec.productId, true)}>${$.escape(adding === rec.productId ? 'Adding…' : 'Add to cart')}</button> <a${$.attr('href', rec.productUrl)} class="rounded border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">View</a></div></article>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--> `);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex justify-start"><div class="rounded-radius bg-muted px-3 py-2 text-sm text-muted-foreground">Thinking…</div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (currentChips().length) {
				$$renderer.push(`<!--[0--><div class="flex flex-wrap gap-2 px-4 pb-2"><!--[-->`);

				const each_array_3 = $.ensure_array_like(currentChips());

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let chip = each_array_3[$$index_3];

					$$renderer.push(`<button type="button" class="rounded-full border border-border px-3 py-1 text-xxs text-foreground transition hover:bg-muted disabled:opacity-50"${$.attr('disabled', loading, true)}>${$.escape(chip)}</button>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <form class="flex items-center gap-2 border-t border-border p-3"><label class="sr-only" for="assistant-input">Message the shopping assistant</label> <input id="assistant-input"${$.attr('value', input)} placeholder="Describe what you're looking for…" class="flex-1 rounded-radius border border-border bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0" autocomplete="off"${$.attr('disabled', loading, true)}/> <button type="submit" class="flex h-9 w-9 items-center justify-center rounded-radius bg-primary text-primary-foreground disabled:opacity-50" aria-label="Send"${$.attr('disabled', loading || !input.trim(), true)}>`);
			Send($$renderer, { class: 'h-4 w-4', 'aria-hidden': 'true' });
			$$renderer.push(`<!----></button></form> <p class="px-4 pb-3 text-center text-xxs text-muted-foreground">Your details are used only to help you shop and are handled securely.</p></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}