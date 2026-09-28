import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Textarea } from '$lib/components/ui/textarea';
import { Check, AlertCircle, Mail, Phone, MapPin, Send } from '@lucide/svelte';
import { page } from '$app/state';
import { ContactUsRenderer } from '$lib/core/composables/index.js';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import { fade, fly } from 'svelte/transition';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let info = { name: '', email: '', message: '' };
		const store = $.derived(() => page?.data?.store);

		// Only real, store-configured contact details — no template fallback address and no
		// invented live-chat SLA. Anything the store record does not carry simply is not shown.
		const contactMethods = $.derived(() => {
			const methods = [];
			const email = store()?.contact?.email || store()?.businessEmail;

			if (email) {
				methods.push({
					icon: Mail,
					title: 'Email',
					value: email,
					description: 'Our team will respond within 24 hours.'
				});
			}

			const phone = store()?.contact?.phone;

			if (phone) {
				methods.push({
					icon: Phone,
					title: 'Phone',
					value: phone,
					description: 'Call us for order and delivery queries.'
				});
			}

			const address = [
				store()?.address?.street,
				store()?.address?.city,
				store()?.address?.state,
				store()?.address?.pincode,
				store()?.address?.country
			].filter(Boolean).join(', ');

			if (address) {
				methods.push({
					icon: MapPin,
					title: 'Address',
					value: address,
					description: 'Registered business address.'
				});
			}

			return methods;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			SeoHeader($$renderer, {
				metaTitle: store()?.name ? `Contact Us | ${store().name}` : 'Contact Us',
				metaDescription: `Get in touch with ${store()?.name || 'us'} about orders, delivery, returns and product questions.`
			});

			$$renderer.push(`<!----> <div class="min-h-screen bg-[#fafafa] py-12 md:py-24"><div class="container mx-auto max-w-6xl px-4">`);

			{
				function content(
					$$renderer,
					{
						error,
						success,
						nameError,
						messageError,
						emailError,
						loading,
						handleSubmit
					}
				) {
					$$renderer.push(`<div class="grid gap-12 lg:grid-cols-12 lg:items-start"><div class="lg:col-span-5"><div class="mb-10"><h1 class="text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">Let's Start a <span class="text-primary">Conversation</span></h1> <p class="mt-6 text-lg leading-relaxed text-gray-500">Have a question about an order or just want to say hi? We're here to help you create the perfect shopping experience.</p></div> `);

					if (contactMethods().length) {
						$$renderer.push(`<!--[0--><div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-1"><!--[-->`);

						const each_array = $.ensure_array_like(contactMethods());

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let method = each_array[$$index];

							$$renderer.push(`<div class="group flex items-start gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"><div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">`);

							if (method.icon) {
								$$renderer.push('<!--[-->');
								method.icon($$renderer, { class: 'h-6 w-6' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</div> <div><h3 class="font-bold text-gray-900">${$.escape(method.title)}</h3> <p class="mt-1 font-medium text-primary">${$.escape(method.value)}</p> <p class="mt-1 text-sm text-gray-400">${$.escape(method.description)}</p></div></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (page?.data?.page?.content) {
						$$renderer.push(`<!--[0--><div class="mt-10 border-t border-gray-100 pt-10"><div class="prose-lg text-sm leading-relaxed text-gray-400 prose-p:my-0 prose-li:my-0">${$.html(page.data.page.content)}</div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="lg:col-span-7">`);

					if (success) {
						$$renderer.push(`<!--[0--><div class="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl md:p-12"><div class="relative mb-8"><div class="absolute inset-0 scale-150 animate-ping rounded-full bg-green-100 opacity-20"></div> <div class="relative flex h-20 w-24 items-center justify-center rounded-full bg-green-50">`);
						Check($$renderer, { class: 'h-10 w-10 text-green-600' });
						$$renderer.push(`<!----></div></div> <h2 class="text-3xl font-bold text-gray-900">Message Sent!</h2> <p class="mt-4 max-w-sm text-lg text-gray-500">Thank you for reaching out. A member of our team will get back to you shortly.</p></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"><div class="bg-gray-50/50 p-8 md:p-10"><h2 class="text-2xl font-bold text-gray-900">Send us a message</h2> <p class="mt-2 text-gray-500">Required fields are marked with an asterisk (*)</p></div> <form class="space-y-6 p-8 md:p-10">`);

						if (error) {
							$$renderer.push(`<!--[0--><div class="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600">`);
							AlertCircle($$renderer, { class: 'h-5 w-5 shrink-0' });
							$$renderer.push(`<!----> <p class="text-sm font-medium">${$.escape(error)}</p></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div class="grid gap-6 sm:grid-cols-2"><div class="space-y-2">`);

						Label($$renderer, {
							for: 'name',
							class: 'text-xs font-black uppercase tracking-widest text-gray-400',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Full Name *`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Input($$renderer, {
							id: 'name',
							placeholder: 'John Doe',
							class: `h-12 border-gray-100 bg-gray-50/30 transition-all focus:bg-white focus:ring-primary/20 ${nameError ? 'border-red-500 focus:ring-red-500/20' : ''}`,
							required: true,
							get value() {
								return info.name;
							},

							set value($$value) {
								info.name = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						if (nameError) {
							$$renderer.push(`<!--[0--><p class="text-[10px] font-bold uppercase tracking-tight text-red-500">${$.escape(nameError)}</p>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="space-y-2">`);

						Label($$renderer, {
							for: 'email',
							class: 'text-xs font-black uppercase tracking-widest text-gray-400',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Email Address *`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Input($$renderer, {
							id: 'email',
							type: 'email',
							placeholder: 'john@example.com',
							class: `h-12 border-gray-100 bg-gray-50/30 transition-all focus:bg-white focus:ring-primary/20 ${emailError ? 'border-red-500 focus:ring-red-500/20' : ''}`,
							required: true,
							get value() {
								return info.email;
							},

							set value($$value) {
								info.email = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						if (emailError) {
							$$renderer.push(`<!--[0--><p class="text-[10px] font-bold uppercase tracking-tight text-red-500">${$.escape(emailError)}</p>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div> <div class="space-y-2">`);

						Label($$renderer, {
							for: 'message',
							class: 'text-xs font-black uppercase tracking-widest text-gray-400',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Your Message *`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Textarea($$renderer, {
							id: 'message',
							placeholder: 'Tell us how we can help...',
							rows: 5,
							class: `min-h-[150px] resize-none border-gray-100 bg-gray-50/30 transition-all focus:bg-white focus:ring-primary/20 ${messageError ? 'border-red-500 focus:ring-red-500/20' : ''}`,
							required: true,
							get value() {
								return info.message;
							},

							set value($$value) {
								info.message = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						if (messageError) {
							$$renderer.push(`<!--[0--><p class="text-[10px] font-bold uppercase tracking-tight text-red-500">${$.escape(messageError)}</p>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						Button($$renderer, {
							type: 'submit',
							class: 'group h-14 w-full text-base font-bold uppercase tracking-[0.2em] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]',
							disabled: loading,
							children: ($$renderer) => {
								if (loading) {
									$$renderer.push(`<!--[0--><div class="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> Processing...`);
								} else {
									$$renderer.push('<!--[-1-->');

									Send($$renderer, {
										class: 'mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1'
									});

									$$renderer.push(`<!----> Send Message`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <p class="text-center text-[10px] font-medium text-gray-400">By clicking "Send Message", you agree to our <a href="/terms-and-conditions" class="text-primary hover:underline">Terms</a> and <a href="/privacy-policy" class="text-primary hover:underline">Privacy Policy</a>.</p></form></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				ContactUsRenderer($$renderer, {
					get info() {
						return info;
					},

					set info($$value) {
						info = $$value;
						$$settled = false;
					},
					content,
					$$slots: { content: true }
				});
			}

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}