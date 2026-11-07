import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { fly, fade } from 'svelte/transition';
import { MessageCircle, X, Send, Sparkles, Truck, Clock } from '@lucide/svelte';
import { toast } from 'svelte-sonner';
import { getCartState } from '$lib/core/stores/index.js';
import { formatPrice } from '$lib/core/utils';
import { assistantService } from '$lib/services/assistant-service';

var root = $.from_html(`<button type="button" class="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-z-10 transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"><!></button>`);
var root_1 = $.from_html(`<p class="text-sm text-muted-foreground">Try: “My marriage day is 01-Aug. Suggest me diamond rings.”</p>`);
var root_2 = $.from_html(`<img class="h-20 w-20 flex-shrink-0 rounded object-cover" loading="lazy"/>`);
var root_3 = $.from_html(`<p class="mt-0.5 text-xxs text-muted-foreground"> </p>`);
var root_4 = $.from_html(`<li class="flex gap-1"><span aria-hidden="true">•</span> <span> </span></li>`);
var root_5 = $.from_html(`<ul class="border-t border-border px-3 py-2 text-xxs text-muted-foreground"></ul>`);
var root_6 = $.from_html(`<article class="overflow-hidden rounded-radius border border-border bg-background"><div class="flex gap-3 p-3"><!> <div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-2"><h3 class="truncate text-sm font-medium"> </h3> <span> </span></div> <p class="mt-0.5 text-sm font-semibold"> </p> <!> <p class="mt-1 flex items-center gap-1 text-xxs text-muted-foreground"><!> </p></div></div> <!> <div class="flex gap-2 border-t border-border p-2"><button type="button" class="flex-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"> </button> <a class="rounded border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">View</a></div></article>`);
var root_7 = $.from_html(`<div class="space-y-3"></div>`);
var root_8 = $.from_html(`<div><div> </div></div> <!>`, 1);
var root_9 = $.from_html(`<div class="flex justify-start"><div class="rounded-radius bg-muted px-3 py-2 text-sm text-muted-foreground">Thinking…</div></div>`);
var root_10 = $.from_html(`<button type="button" class="rounded-full border border-border px-3 py-1 text-xxs text-foreground transition hover:bg-muted disabled:opacity-50"> </button>`);
var root_11 = $.from_html(`<div class="flex flex-wrap gap-2 px-4 pb-2"></div>`);
var root_12 = $.from_html(`<button type="button" class="fixed inset-0 z-40 bg-black/30 md:hidden" aria-label="Close shopping assistant"></button> <section class="fixed bottom-0 right-0 z-40 flex h-[85vh] w-full flex-col overflow-hidden rounded-t-radius border border-border bg-card text-card-foreground shadow-z-10 md:bottom-24 md:right-5 md:h-[600px] md:w-[400px] md:rounded-radius" role="dialog" aria-modal="true" aria-label="Shopping assistant"><header class="flex items-center justify-between border-b border-border px-4 py-3"><div class="flex items-center gap-2"><!> <div><h2 class="font-heading text-sm font-semibold leading-tight">Find the perfect ring for your special day</h2> <p class="text-xxs text-muted-foreground">Tell me what you're looking for, and I'll help you find the right ring.</p></div></div> <button type="button" class="rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Close"><!></button></header> <div class="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-label="Conversation"><!> <!> <!></div> <!> <form class="flex items-center gap-2 border-t border-border p-3"><label class="sr-only" for="assistant-input">Message the shopping assistant</label> <input id="assistant-input" placeholder="Describe what you're looking for…" class="flex-1 rounded-radius border border-border bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0" autocomplete="off"/> <button type="submit" class="flex h-9 w-9 items-center justify-center rounded-radius bg-primary text-primary-foreground disabled:opacity-50" aria-label="Send"><!></button></form> <p class="px-4 pb-3 text-center text-xxs text-muted-foreground">Your details are used only to help you shop and are handled securely.</p></section>`, 1);
var root_13 = $.from_html(`<!> <!>`, 1);

export default function Conversational_shopping($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let enabled = $.state(false);
	let input = $.state('');
	let loading = $.state(false);
	let sessionId = $.state(null);
	let messages = $.state($.proxy([]));
	let listEl = $.state(null);
	let adding = $.state(null);
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
		const last = $.get(messages)[$.get(messages).length - 1];

		if (last?.nextQuestion?.options?.length) {
			return last.nextQuestion.options.map((o) => o.value);
		}

		return $.get(messages).length === 0 ? initialChips : [];
	});

	async function ensureSession() {
		if ($.get(sessionId)) return $.get(sessionId);

		const existing = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
		const session = await assistantService.createSession(existing ?? undefined);

		$.set(sessionId, session.sessionId, true);

		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, session.sessionId);

		return session.sessionId;
	}

	async function scrollToBottom() {
		await Promise.resolve();

		if ($.get(listEl)) $.get(listEl).scrollTop = $.get(listEl).scrollHeight;
	}

	async function send(text) {
		const message = text.trim();

		if (!message || $.get(loading)) return;

		$.set(input, '');
		$.set(messages, [...$.get(messages), { role: 'user', text: message }], true);
		$.set(loading, true);
		scrollToBottom();

		try {
			const id = await ensureSession();
			const res = await assistantService.sendMessage(id, message);

			$.set(
				messages,
				[
					...$.get(messages),
					{
						role: 'assistant',
						text: res.message,
						recommendations: res.recommendations,
						nextQuestion: res.nextQuestion
					}
				],
				true
			);

			if (res.recommendations?.length) {
				assistantService.postEvent(id, { type: 'assistant_products_shown' }).catch(() => {});
			}
		} catch {
			$.set(
				messages,
				[
					...$.get(messages),
					{
						role: 'assistant',
						text: 'Sorry — I had trouble just now. Please try again.'
					}
				],
				true
			);
		} finally {
			$.set(loading, false);
			scrollToBottom();
		}
	}

	async function addToCart(rec) {
		if (!$.get(sessionId) || !rec.variantId || $.get(adding)) return;

		$.set(adding, rec.productId, true);

		try {
			// Revalidate server-side before mutating the cart (price/stock/visibility).
			const result = await assistantService.addToCart($.get(sessionId), { productId: rec.productId, variantId: rec.variantId, qty: 1 });

			if (!result.valid) {
				toast.error(result.reason ?? 'This item is no longer available.');

				return;
			}

			if (!cartState) {
				toast.error('Could not add to cart. Please open the product page.');

				return;
			}

			await cartState.add({ productId: rec.productId, variantId: rec.variantId, qty: 1 });
			assistantService.postEvent($.get(sessionId), { type: 'assistant_add_to_cart', productId: rec.productId }).catch(() => {});
			toast.success('Added to cart');
		} catch {
			toast.error('Could not add to cart. Please open the product page.');
		} finally {
			$.set(adding, null);
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
			$.set(sessionId, localStorage.getItem(STORAGE_KEY), true);
		}

		// Gate the widget on the store's admin toggle (kitcommerce-admin).
		const config = await assistantService.getConfig();

		$.set(enabled, config.enabled, true);
	});

	function toggle() {
		$.set(open, !$.get(open));

		if ($.get(open) && $.get(sessionId)) assistantService.postEvent($.get(sessionId), { type: 'assistant_opened' }).catch(() => {});
	}

	var fragment = root_13();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var button = root();
			var node_1 = $.child(button);

			{
				var consequent = ($$anchor) => {
					X($$anchor, { class: 'h-6 w-6', 'aria-hidden': 'true' });
				};

				var alternate = ($$anchor) => {
					MessageCircle($$anchor, { class: 'h-6 w-6', 'aria-hidden': 'true' });
				};

				$.if(node_1, ($$render) => {
					if ($.get(open)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(button);

			$.template_effect(() => {
				$.set_attribute(button, 'aria-label', $.get(open)
					? 'Close shopping assistant'
					: 'Open shopping assistant');

				$.set_attribute(button, 'aria-expanded', $.get(open));
			});

			$.delegated('click', button, toggle);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($.get(enabled)) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_10 = ($$anchor) => {
			var fragment_3 = root_12();
			var button_1 = $.first_child(fragment_3);
			var section = $.sibling(button_1, 2);
			var header = $.child(section);
			var div = $.child(header);
			var node_3 = $.child(div);

			Sparkles(node_3, { class: 'h-5 w-5 text-primary', 'aria-hidden': 'true' });
			$.next(2);
			$.reset(div);

			var button_2 = $.sibling(div, 2);
			var node_4 = $.child(button_2);

			X(node_4, { class: 'h-5 w-5', 'aria-hidden': 'true' });
			$.reset(button_2);
			$.reset(header);

			var div_1 = $.sibling(header, 2);
			var node_5 = $.child(div_1);

			{
				var consequent_2 = ($$anchor) => {
					var p = root_1();

					$.append($$anchor, p);
				};

				$.if(node_5, ($$render) => {
					if ($.get(messages).length === 0) $$render(consequent_2);
				});
			}

			var node_6 = $.sibling(node_5, 2);

			$.each(node_6, 16, () => $.get(messages), (msg) => msg, ($$anchor, msg) => {
				var fragment_4 = root_8();
				var div_2 = $.first_child(fragment_4);
				var div_3 = $.child(div_2);
				var text_1 = $.only_child(div_3, true);

				$.reset(div_2);

				var node_7 = $.sibling(div_2, 2);

				{
					var consequent_7 = ($$anchor) => {
						var div_4 = root_7();

						$.each(div_4, 21, () => msg.recommendations, (rec) => rec.productId, ($$anchor, rec) => {
							var article = root_6();
							var div_5 = $.child(article);
							var node_8 = $.child(div_5);

							{
								var consequent_3 = ($$anchor) => {
									var img = root_2();

									$.template_effect(() => {
										$.set_attribute(img, 'src', $.get(rec).image);
										$.set_attribute(img, 'alt', $.get(rec).title);
									});

									$.append($$anchor, img);
								};

								$.if(node_8, ($$render) => {
									if ($.get(rec).image) $$render(consequent_3);
								});
							}

							var div_6 = $.sibling(node_8, 2);
							var div_7 = $.child(div_6);
							var h3 = $.child(div_7);
							var text_2 = $.only_child(h3, true);
							var span = $.sibling(h3, 2);
							var text_3 = $.only_child(span, true);

							$.reset(div_7);

							var p_1 = $.sibling(div_7, 2);
							var text_4 = $.only_child(p_1, true);
							var node_9 = $.sibling(p_1, 2);

							{
								var consequent_4 = ($$anchor) => {
									var p_2 = root_3();
									var text_5 = $.only_child(p_2, true);

									$.template_effect(($0) => $.set_text(text_5, $0), [
										() => [
											$.get(rec).metal,
											$.get(rec).diamond,
											$.get(rec).certification
										].filter(Boolean).join(' · ')
									]);

									$.append($$anchor, p_2);
								};

								$.if(node_9, ($$render) => {
									if ($.get(rec).metal || $.get(rec).diamond || $.get(rec).certification) $$render(consequent_4);
								});
							}

							var p_3 = $.sibling(node_9, 2);
							var node_10 = $.child(p_3);

							{
								var consequent_5 = ($$anchor) => {
									Truck($$anchor, { class: 'h-3 w-3', 'aria-hidden': 'true' });
								};

								var alternate_1 = ($$anchor) => {
									Clock($$anchor, { class: 'h-3 w-3', 'aria-hidden': 'true' });
								};

								$.if(node_10, ($$render) => {
									if ($.get(rec).fulfillment === 'ready_to_ship') $$render(consequent_5); else $$render(alternate_1, -1);
								});
							}

							var text_6 = $.sibling(node_10);

							$.reset(p_3);
							$.reset(div_6);
							$.reset(div_5);

							var node_11 = $.sibling(div_5, 2);

							{
								var consequent_6 = ($$anchor) => {
									var ul = root_5();

									$.each(ul, 21, () => $.get(rec).reasons.slice(0, 2), $.index, ($$anchor, reason) => {
										var li = root_4();
										var span_1 = $.sibling($.child(li), 2);
										var text_7 = $.only_child(span_1, true);

										$.reset(li);
										$.template_effect(() => $.set_text(text_7, $.get(reason)));
										$.append($$anchor, li);
									});

									$.reset(ul);
									$.append($$anchor, ul);
								};

								$.if(node_11, ($$render) => {
									if ($.get(rec).reasons?.length) $$render(consequent_6);
								});
							}

							var div_8 = $.sibling(node_11, 2);
							var button_3 = $.child(div_8);
							var text_8 = $.only_child(button_3, true);
							var a = $.sibling(button_3, 2);

							$.reset(div_8);
							$.reset(article);

							$.template_effect(
								($0, $1, $2) => {
									$.set_text(text_2, $.get(rec).title);

									$.set_class(span, 1, `whitespace-nowrap rounded-full px-2 py-0.5 text-xxs ${$.get(rec).isAlternative
										? 'bg-accent text-accent-foreground'
										: 'bg-secondary text-secondary-foreground'}`);

									$.set_text(text_3, $0);
									$.set_text(text_4, $1);
									$.set_text(text_6, ` ${$2 ?? ''}`);
									button_3.disabled = !$.get(rec).variantId || $.get(adding) === $.get(rec).productId;
									$.set_text(text_8, $.get(adding) === $.get(rec).productId ? 'Adding…' : 'Add to cart');
									$.set_attribute(a, 'href', $.get(rec).productUrl);
								},
								[
									() => fulfilmentLabel($.get(rec)),
									() => formatPrice($.get(rec).price, $.get(rec).currency),
									() => deliveryLine($.get(rec))
								]
							);

							$.delegated('click', button_3, () => addToCart($.get(rec)));
							$.append($$anchor, article);
						});

						$.reset(div_4);
						$.append($$anchor, div_4);
					};

					$.if(node_7, ($$render) => {
						if (msg.recommendations?.length) $$render(consequent_7);
					});
				}

				$.template_effect(() => {
					$.set_class(div_2, 1, `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`);

					$.set_class(div_3, 1, `max-w-[85%] rounded-radius px-3 py-2 text-sm ${msg.role === 'user'
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-foreground'}`);

					$.set_text(text_1, msg.text);
				});

				$.append($$anchor, fragment_4);
			});

			var node_12 = $.sibling(node_6, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_9 = root_9();

					$.append($$anchor, div_9);
				};

				$.if(node_12, ($$render) => {
					if ($.get(loading)) $$render(consequent_8);
				});
			}

			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(listEl, $$value), () => $.get(listEl));

			var node_13 = $.sibling(div_1, 2);

			{
				var consequent_9 = ($$anchor) => {
					var div_10 = root_11();

					$.each(div_10, 21, () => $.get(currentChips), $.index, ($$anchor, chip) => {
						var button_4 = root_10();
						var text_9 = $.only_child(button_4, true);

						$.template_effect(() => {
							button_4.disabled = $.get(loading);
							$.set_text(text_9, $.get(chip));
						});

						$.delegated('click', button_4, () => send($.get(chip)));
						$.append($$anchor, button_4);
					});

					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				$.if(node_13, ($$render) => {
					if ($.get(currentChips).length) $$render(consequent_9);
				});
			}

			var form = $.sibling(node_13, 2);
			var input_1 = $.sibling($.child(form), 2);

			$.remove_input_defaults(input_1);

			var button_5 = $.sibling(input_1, 2);
			var node_14 = $.child(button_5);

			Send(node_14, { class: 'h-4 w-4', 'aria-hidden': 'true' });
			$.reset(button_5);
			$.reset(form);
			$.next(2);
			$.reset(section);

			$.template_effect(
				($0) => {
					input_1.disabled = $.get(loading);
					button_5.disabled = $0;
				},
				[() => $.get(loading) || !$.get(input).trim()]
			);

			$.delegated('click', button_1, toggle);
			$.transition(3, button_1, () => fade, () => ({ duration: 150 }));
			$.delegated('click', button_2, toggle);

			$.event('submit', form, (e) => {
				e.preventDefault();
				send($.get(input));
			});

			$.bind_value(input_1, () => $.get(input), ($$value) => $.set(input, $$value));
			$.transition(3, section, () => fly, () => ({ y: 24, duration: 200 }));
			$.append($$anchor, fragment_3);
		};

		$.if(node_2, ($$render) => {
			if ($.get(enabled) && $.get(open)) $$render(consequent_10);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);