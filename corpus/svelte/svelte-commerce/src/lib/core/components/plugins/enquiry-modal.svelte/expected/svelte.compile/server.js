import * as $ from 'svelte/internal/server';
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

export default function Enquiry_modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			isOpen = false,
			productId = '',
			productTitle = '',
			onClose = () => {}
		} = $$props;

		const enquiryPlugin = $.derived(() => page.data?.store?.plugins?.enquiryMode);
		let name = '';
		let email = '';
		let phone = '';
		let message = '';
		let loading = false;
		const modalHistoryKey = '__svelteCommerceEnquiryModal';
		let ownsHistoryEntry = false;

		function handleBrowserBack() {
			if (!isOpen || !ownsHistoryEntry) return;

			ownsHistoryEntry = false;
			onClose();
		}

		onMount(() => {
			window.addEventListener('popstate', handleBrowserBack);

			return () => window.removeEventListener('popstate', handleBrowserBack);
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
				loading = true;
				await enquiryService.create({ name, email, phone, message, productId });
				toast.success('Enquiry submitted successfully');
				await goto('/enquiry/success');
			} catch(e) {
				toast.error(e?.message || 'Failed to submit enquiry');
			} finally {
				loading = false;
				onClose();
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (isOpen) {
				$$renderer.push(`<!--[0--><div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"><div class="relative w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800"><button class="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">`);
				X($$renderer, { size: 20 });
				$$renderer.push(`<!----></button> <h2 class="mb-4 text-xl font-semibold dark:text-white">${$.escape(productTitle)}</h2> <form class="space-y-4"><div>`);

				Textbox($$renderer, {
					schema: schema.name,
					type: 'text',
					label: 'Your Name',
					required: true,
					get value() {
						return name;
					},

					set value($$value) {
						name = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> <div>`);

				Textbox($$renderer, {
					schema: schema.email,
					type: 'email',
					label: 'Your Email',
					required: true,
					get value() {
						return email;
					},

					set value($$value) {
						email = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> <div>`);

				Textbox($$renderer, {
					schema: schema.phone,
					type: 'tel',
					label: 'Your Phone',
					required: true,
					get value() {
						return phone;
					},

					set value($$value) {
						phone = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> <div>`);

				Textarea($$renderer, {
					placeholder: 'Your Message',
					required: true,
					rows: 4,
					get value() {
						return message;
					},

					set value($$value) {
						message = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> `);

				Button($$renderer, {
					type: 'submit',
					class: 'w-full',
					disabled: loading,
					children: ($$renderer) => {
						if (loading) {
							$$renderer.push('<!--[0-->');
							LoaderCircle($$renderer, { class: 'animate-spin' });
						} else {
							$$renderer.push(`<!--[-1-->Submit Enquiry`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></form></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}