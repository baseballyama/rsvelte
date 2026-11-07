import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Textarea } from '$lib/components/ui/textarea';
import { Check, AlertCircle, Mail, Phone, MapPin, Send } from '@lucide/svelte';
import { page } from '$app/state';
import { ContactUsRenderer } from '$lib/core/composables/index.js';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import { fade, fly } from 'svelte/transition';

var root = $.from_html(`<div class="group flex items-start gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"><div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white"><!></div> <div><h3 class="font-bold text-gray-900"> </h3> <p class="mt-1 font-medium text-primary"> </p> <p class="mt-1 text-sm text-gray-400"> </p></div></div>`);
var root_1 = $.from_html(`<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-1"></div>`);
var root_2 = $.from_html(`<div class="mt-10 border-t border-gray-100 pt-10"><div class="prose-lg text-sm leading-relaxed text-gray-400 prose-p:my-0 prose-li:my-0"></div></div>`);
var root_3 = $.from_html(`<div class="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl md:p-12"><div class="relative mb-8"><div class="absolute inset-0 scale-150 animate-ping rounded-full bg-green-100 opacity-20"></div> <div class="relative flex h-20 w-24 items-center justify-center rounded-full bg-green-50"><!></div></div> <h2 class="text-3xl font-bold text-gray-900">Message Sent!</h2> <p class="mt-4 max-w-sm text-lg text-gray-500">Thank you for reaching out. A member of our team will get back to you shortly.</p></div>`);
var root_4 = $.from_html(`<div class="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600"><!> <p class="text-sm font-medium"> </p></div>`);
var root_5 = $.from_html(`<p class="text-[10px] font-bold uppercase tracking-tight text-red-500"> </p>`);
var root_6 = $.from_html(`<div class="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> Processing...`, 1);
var root_7 = $.from_html(`<!> Send Message`, 1);
var root_8 = $.from_html(`<div class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"><div class="bg-gray-50/50 p-8 md:p-10"><h2 class="text-2xl font-bold text-gray-900">Send us a message</h2> <p class="mt-2 text-gray-500">Required fields are marked with an asterisk (*)</p></div> <form class="space-y-6 p-8 md:p-10"><!> <div class="grid gap-6 sm:grid-cols-2"><div class="space-y-2"><!> <!> <!></div> <div class="space-y-2"><!> <!> <!></div></div> <div class="space-y-2"><!> <!> <!></div> <!> <p class="text-center text-[10px] font-medium text-gray-400">By clicking "Send Message", you agree to our <a href="/terms-and-conditions" class="text-primary hover:underline">Terms</a> and <a href="/privacy-policy" class="text-primary hover:underline">Privacy Policy</a>.</p></form></div>`);
var root_9 = $.from_html(`<div class="grid gap-12 lg:grid-cols-12 lg:items-start"><div class="lg:col-span-5"><div class="mb-10"><h1 class="text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">Let's Start a <span class="text-primary">Conversation</span></h1> <p class="mt-6 text-lg leading-relaxed text-gray-500">Have a question about an order or just want to say hi? We're here to help you create the perfect shopping experience.</p></div> <!> <!></div> <div class="lg:col-span-7"><!></div></div>`);
var root_10 = $.from_html(`<!> <div class="min-h-screen bg-[#fafafa] py-12 md:py-24"><div class="container mx-auto max-w-6xl px-4"><!></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let info = $.state($.proxy({ name: '', email: '', message: '' }));
	const store = $.derived(() => page?.data?.store);

	// Only real, store-configured contact details — no template fallback address and no
	// invented live-chat SLA. Anything the store record does not carry simply is not shown.
	const contactMethods = $.derived(() => {
		const methods = [];
		const email = $.get(store)?.contact?.email || $.get(store)?.businessEmail;

		if (email) {
			methods.push({
				icon: Mail,
				title: 'Email',
				value: email,
				description: 'Our team will respond within 24 hours.'
			});
		}

		const phone = $.get(store)?.contact?.phone;

		if (phone) {
			methods.push({
				icon: Phone,
				title: 'Phone',
				value: phone,
				description: 'Call us for order and delivery queries.'
			});
		}

		const address = [
			$.get(store)?.address?.street,
			$.get(store)?.address?.city,
			$.get(store)?.address?.state,
			$.get(store)?.address?.pincode,
			$.get(store)?.address?.country
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

	var fragment = root_10();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $.get(store)?.name ? `Contact Us | ${$.get(store).name}` : 'Contact Us');
		let $1 = $.derived(() => `Get in touch with ${$.get(store)?.name || 'us'} about orders, delivery, returns and product questions.`);

		SeoHeader(node, {
			get metaTitle() {
				return $.get($0);
			},

			get metaDescription() {
				return $.get($1);
			}
		});
	}

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var node_1 = $.child(div_1);

	{
		const content = ($$anchor, $$arg0) => {
			let error = () => ($$arg0?.()).error;
			let success = () => ($$arg0?.()).success;
			let nameError = () => ($$arg0?.()).nameError;
			let messageError = () => ($$arg0?.()).messageError;
			let emailError = () => ($$arg0?.()).emailError;
			let loading = () => ($$arg0?.()).loading;
			let handleSubmit = () => ($$arg0?.()).handleSubmit;
			var div_2 = root_9();
			var div_3 = $.child(div_2);
			var node_2 = $.sibling($.child(div_3), 2);

			{
				var consequent = ($$anchor) => {
					var div_4 = root_1();

					$.each(div_4, 21, () => $.get(contactMethods), $.index, ($$anchor, method) => {
						var div_5 = root();
						var div_6 = $.child(div_5);
						var node_3 = $.child(div_6);

						$.component(node_3, () => $.get(method).icon, ($$anchor, method_icon) => {
							method_icon($$anchor, { class: 'h-6 w-6' });
						});

						$.reset(div_6);

						var div_7 = $.sibling(div_6, 2);
						var h3 = $.child(div_7);
						var text = $.only_child(h3, true);
						var p = $.sibling(h3, 2);
						var text_1 = $.only_child(p, true);
						var p_1 = $.sibling(p, 2);
						var text_2 = $.only_child(p_1, true);

						$.reset(div_7);
						$.reset(div_5);

						$.template_effect(() => {
							$.set_text(text, $.get(method).title);
							$.set_text(text_1, $.get(method).value);
							$.set_text(text_2, $.get(method).description);
						});

						$.append($$anchor, div_5);
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_2, ($$render) => {
					if ($.get(contactMethods).length) $$render(consequent);
				});
			}

			var node_4 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_8 = root_2();
					var div_9 = $.child(div_8);

					$.html(div_9, () => page.data.page.content, true);
					$.reset(div_9);
					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				$.if(node_4, ($$render) => {
					if (page?.data?.page?.content) $$render(consequent_1);
				});
			}

			$.reset(div_3);

			var div_10 = $.sibling(div_3, 2);
			var node_5 = $.child(div_10);

			{
				var consequent_2 = ($$anchor) => {
					var div_11 = root_3();
					var div_12 = $.child(div_11);
					var div_13 = $.sibling($.child(div_12), 2);
					var node_6 = $.child(div_13);

					Check(node_6, { class: 'h-10 w-10 text-green-600' });
					$.reset(div_13);
					$.reset(div_12);
					$.next(4);
					$.reset(div_11);
					$.transition(1, div_11, () => fade);
					$.append($$anchor, div_11);
				};

				var alternate_1 = ($$anchor) => {
					var div_14 = root_8();
					var form = $.sibling($.child(div_14), 2);
					var node_7 = $.child(form);

					{
						var consequent_3 = ($$anchor) => {
							var div_15 = root_4();
							var node_8 = $.child(div_15);

							AlertCircle(node_8, { class: 'h-5 w-5 shrink-0' });

							var p_2 = $.sibling(node_8, 2);
							var text_3 = $.only_child(p_2, true);

							$.reset(div_15);
							$.template_effect(() => $.set_text(text_3, error()));
							$.transition(1, div_15, () => fade);
							$.append($$anchor, div_15);
						};

						$.if(node_7, ($$render) => {
							if (error()) $$render(consequent_3);
						});
					}

					var div_16 = $.sibling(node_7, 2);
					var div_17 = $.child(div_16);
					var node_9 = $.child(div_17);

					Label(node_9, {
						for: 'name',
						class: 'text-xs font-black uppercase tracking-widest text-gray-400',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Full Name *');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					{
						let $0 = $.derived(() => nameError() ? 'border-red-500 focus:ring-red-500/20' : '');

						Input(node_10, {
							id: 'name',
							placeholder: 'John Doe',
							get class() {
								return `h-12 border-gray-100 bg-gray-50/30 transition-all focus:bg-white focus:ring-primary/20 ${$.get($0) ?? ''}`;
							},
							required: true,
							get value() {
								return $.get(info).name;
							},

							set value($$value) {
								$.get(info).name = $$value;
							}
						});
					}

					var node_11 = $.sibling(node_10, 2);

					{
						var consequent_4 = ($$anchor) => {
							var p_3 = root_5();
							var text_5 = $.only_child(p_3, true);

							$.template_effect(() => $.set_text(text_5, nameError()));
							$.append($$anchor, p_3);
						};

						$.if(node_11, ($$render) => {
							if (nameError()) $$render(consequent_4);
						});
					}

					$.reset(div_17);

					var div_18 = $.sibling(div_17, 2);
					var node_12 = $.child(div_18);

					Label(node_12, {
						for: 'email',
						class: 'text-xs font-black uppercase tracking-widest text-gray-400',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Email Address *');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					{
						let $0 = $.derived(() => emailError() ? 'border-red-500 focus:ring-red-500/20' : '');

						Input(node_13, {
							id: 'email',
							type: 'email',
							placeholder: 'john@example.com',
							get class() {
								return `h-12 border-gray-100 bg-gray-50/30 transition-all focus:bg-white focus:ring-primary/20 ${$.get($0) ?? ''}`;
							},
							required: true,
							get value() {
								return $.get(info).email;
							},

							set value($$value) {
								$.get(info).email = $$value;
							}
						});
					}

					var node_14 = $.sibling(node_13, 2);

					{
						var consequent_5 = ($$anchor) => {
							var p_4 = root_5();
							var text_7 = $.only_child(p_4, true);

							$.template_effect(() => $.set_text(text_7, emailError()));
							$.append($$anchor, p_4);
						};

						$.if(node_14, ($$render) => {
							if (emailError()) $$render(consequent_5);
						});
					}

					$.reset(div_18);
					$.reset(div_16);

					var div_19 = $.sibling(div_16, 2);
					var node_15 = $.child(div_19);

					Label(node_15, {
						for: 'message',
						class: 'text-xs font-black uppercase tracking-widest text-gray-400',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Your Message *');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					{
						let $0 = $.derived(() => messageError() ? 'border-red-500 focus:ring-red-500/20' : '');

						Textarea(node_16, {
							id: 'message',
							placeholder: 'Tell us how we can help...',
							rows: 5,
							get class() {
								return `min-h-[150px] resize-none border-gray-100 bg-gray-50/30 transition-all focus:bg-white focus:ring-primary/20 ${$.get($0) ?? ''}`;
							},
							required: true,
							get value() {
								return $.get(info).message;
							},

							set value($$value) {
								$.get(info).message = $$value;
							}
						});
					}

					var node_17 = $.sibling(node_16, 2);

					{
						var consequent_6 = ($$anchor) => {
							var p_5 = root_5();
							var text_9 = $.only_child(p_5, true);

							$.template_effect(() => $.set_text(text_9, messageError()));
							$.append($$anchor, p_5);
						};

						$.if(node_17, ($$render) => {
							if (messageError()) $$render(consequent_6);
						});
					}

					$.reset(div_19);

					var node_18 = $.sibling(div_19, 2);

					Button(node_18, {
						type: 'submit',
						class: 'group h-14 w-full text-base font-bold uppercase tracking-[0.2em] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]',
						get disabled() {
							return loading();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_19 = $.first_child(fragment_1);

							{
								var consequent_7 = ($$anchor) => {
									var fragment_2 = root_6();

									$.next();
									$.append($$anchor, fragment_2);
								};

								var alternate = ($$anchor) => {
									var fragment_3 = root_7();
									var node_20 = $.first_child(fragment_3);

									Send(node_20, {
										class: 'mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1'
									});

									$.next();
									$.append($$anchor, fragment_3);
								};

								$.if(node_19, ($$render) => {
									if (loading()) $$render(consequent_7); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.reset(form);
					$.reset(div_14);

					$.event('submit', form, function (...$$args) {
						handleSubmit()?.apply(this, $$args);
					});

					$.append($$anchor, div_14);
				};

				$.if(node_5, ($$render) => {
					if (success()) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_10);
			$.reset(div_2);
			$.transition(1, div_3, () => fly, () => ({ x: -20, duration: 600 }));
			$.transition(1, div_10, () => fly, () => ({ x: 20, duration: 600, delay: 200 }));
			$.append($$anchor, div_2);
		};

		ContactUsRenderer(node_1, {
			get info() {
				return $.get(info);
			},

			set info($$value) {
				$.set(info, $$value, true);
			},
			content,
			$$slots: { content: true }
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}