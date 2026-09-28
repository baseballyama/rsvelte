import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';
import Textbox from '$lib/components/form/textbox.svelte';
import { Textarea } from '$lib/components/ui/textarea';
import { LoaderCircle, X } from '@lucide/svelte';
import { enquiryService, EnquiryService } from '$lib/core/services';
import { z } from 'zod';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { onDestroy, onMount } from 'svelte';

var root = $.from_html(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"><div class="relative w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800"><button class="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><!></button> <h2 class="mb-4 text-xl font-semibold dark:text-white"> </h2> <form class="space-y-4"><div><!></div> <div><!></div> <div><!></div> <div><!></div> <!></form></div></div>`);

export default function Enquiry_modal($$anchor, $$props) {
	$.push($$props, true);

	let isOpen = $.prop($$props, 'isOpen', 3, false),
		productId = $.prop($$props, 'productId', 3, ''),
		productTitle = $.prop($$props, 'productTitle', 3, ''),
		onClose = $.prop($$props, 'onClose', 3, () => {});

	const enquiryPlugin = $.derived(() => page.data?.store?.plugins?.enquiryMode);
	let name = $.state('');
	let email = $.state('');
	let phone = $.state('');
	let message = $.state('');
	let loading = $.state(false);
	const modalHistoryKey = '__svelteCommerceEnquiryModal';
	let ownsHistoryEntry = false;

	function handleBrowserBack() {
		if (!isOpen() || !ownsHistoryEntry) return;

		ownsHistoryEntry = false;
		onClose()();
	}

	onMount(() => {
		window.addEventListener('popstate', handleBrowserBack);

		return () => window.removeEventListener('popstate', handleBrowserBack);
	});

	$.user_effect(() => {
		if (typeof window === 'undefined') return;

		if (isOpen() && !ownsHistoryEntry) {
			history.pushState({ ...history.state, [modalHistoryKey]: true }, '', window.location.href);
			ownsHistoryEntry = true;
		} else if (!isOpen() && ownsHistoryEntry) {
			const isCurrentModalEntry = history.state?.[modalHistoryKey] === true;

			ownsHistoryEntry = false;

			if (isCurrentModalEntry) history.back();
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined' && ownsHistoryEntry && history.state?.[modalHistoryKey] === true) {
			history.back();
		}
	});

	const schema = {
		name: z.string().min(2, 'First name must be at least 2 characters'),
		email: z.string().email('Please enter a valid email address').min(5, 'Email must be at least 5 characters').max(100, 'Email must be less than 100 characters'),
		phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number').min(9, 'Please enter a valid phone number')
	};

	async function handleSubmit() {
		// TODO: Implement enquiry submission logic
		try {
			$.set(loading, true);

			await enquiryService.create({
				name: $.get(name),
				email: $.get(email),
				phone: $.get(phone),
				message: $.get(message),
				productId: productId()
			});

			toast.success('Enquiry submitted successfully');
			await goto('/enquiry/success');
		} catch(e) {
			toast.error(e?.message || 'Failed to submit enquiry');
		} finally {
			$.set(loading, false);
			onClose()();
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var button = $.child(div_1);
			var node_1 = $.child(button);

			X(node_1, { size: 20 });
			$.reset(button);

			var h2 = $.sibling(button, 2);
			var text = $.only_child(h2, true);
			var form = $.sibling(h2, 2);
			var div_2 = $.child(form);
			var node_2 = $.child(div_2);

			Textbox(node_2, {
				get schema() {
					return schema.name;
				},
				type: 'text',
				label: 'Your Name',
				required: true,
				get value() {
					return $.get(name);
				},

				set value($$value) {
					$.set(name, $$value, true);
				}
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_3 = $.child(div_3);

			Textbox(node_3, {
				get schema() {
					return schema.email;
				},
				type: 'email',
				label: 'Your Email',
				required: true,
				get value() {
					return $.get(email);
				},

				set value($$value) {
					$.set(email, $$value, true);
				}
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_4 = $.child(div_4);

			Textbox(node_4, {
				get schema() {
					return schema.phone;
				},
				type: 'tel',
				label: 'Your Phone',
				required: true,
				get value() {
					return $.get(phone);
				},

				set value($$value) {
					$.set(phone, $$value, true);
				}
			});

			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_5 = $.child(div_5);

			Textarea(node_5, {
				placeholder: 'Your Message',
				required: true,
				rows: 4,
				get value() {
					return $.get(message);
				},

				set value($$value) {
					$.set(message, $$value, true);
				}
			});

			$.reset(div_5);

			var node_6 = $.sibling(div_5, 2);

			Button(node_6, {
				type: 'submit',
				class: 'w-full',
				get disabled() {
					return $.get(loading);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_7 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							LoaderCircle($$anchor, { class: 'animate-spin' });
						};

						var alternate = ($$anchor) => {
							var text_1 = $.text('Submit Enquiry');

							$.append($$anchor, text_1);
						};

						$.if(node_7, ($$render) => {
							if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(form);
			$.reset(div_1);
			$.reset(div);
			$.template_effect(() => $.set_text(text, productTitle()));
			$.delegated('click', button, (e) => onClose()());

			$.event('submit', form, (e) => {
				e.preventDefault();
				handleSubmit();
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (isOpen()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);