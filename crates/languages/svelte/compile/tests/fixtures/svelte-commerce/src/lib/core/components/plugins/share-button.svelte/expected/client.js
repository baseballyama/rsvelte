import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fly, fade } from 'svelte/transition';
import { page } from '$app/state';
import { Email, Facebook, LinkedIn, Pinterest, Telegram, X, WhatsApp } from 'svelte-share-buttons-component';
import facebookIcon from '$lib/assets/social-media/facebook.png';
import gmailIcon from '$lib/assets/social-media/gmail.png';
import linkedinIcon from '$lib/assets/social-media/linkedin.png';
import linkIcon from '$lib/assets/social-media/link.png';
import pinterestIcon from '$lib/assets/social-media/pinterest.png';
import telegramIcon from '$lib/assets/social-media/telegram.png';
import twitterIcon from '$lib/assets/social-media/twitter.png';
import whatsappIcon from '$lib/assets/social-media/whatsapp.png';
import { toast } from '@misiki/kitcommerce-core';

var root = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="group flex flex-col items-center gap-2 focus:outline-none"><div class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-zinc-50 group-active:scale-95 group-active:bg-zinc-100 transition-all border border-zinc-100"><img class="h-14 w-14 rounded-full object-cover"/></div> <span class="text-xs font-medium text-zinc-600"> </span></a>`);
var root_1 = $.from_html(`<button type="button" class="fixed inset-0 z-[9999997] bg-zinc-950/20 backdrop-blur-[2px] transition-opacity focus:outline-none"><span class="sr-only">Close Share Menu</span></button> <div class="absolute right-0 top-12 z-[9999998] hidden w-72 flex-col rounded-radius border border-zinc-200 bg-white p-4 shadow-2xl lg:flex"><div class="mb-4 flex items-center justify-between px-1"><h3 class="text-sm font-bold text-zinc-900">Share Product</h3> <button type="button" class="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 focus:outline-none transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path></svg></button></div> <div class="grid grid-cols-4 gap-y-6 gap-x-2"><div class="flex flex-col items-center gap-1.5"><div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-sm transition-transform hover:scale-110"><!></div> <span class="text-[10px] font-medium text-zinc-500">WhatsApp</span></div> <div class="flex flex-col items-center gap-1.5"><div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-sm transition-transform hover:scale-110"><!></div> <span class="text-[10px] font-medium text-zinc-500">Telegram</span></div> <div class="flex flex-col items-center gap-1.5"><div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-sm transition-transform hover:scale-110"><!></div> <span class="text-[10px] flex font-medium text-zinc-500">Facebook</span></div> <div class="flex flex-col items-center gap-1.5"><div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-sm transition-transform hover:scale-110"><!></div> <span class="text-[10px] font-medium text-zinc-500">X</span></div> <div class="flex flex-col items-center gap-1.5"><div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-sm transition-transform hover:scale-110"><!></div> <span class="text-[10px] font-medium text-zinc-500">Pinterest</span></div> <div class="flex flex-col items-center gap-1.5"><div class="flex h-10 w-10 overflow-hidden rounded-full shadow-sm transition-transform hover:scale-110"><!></div> <span class="text-[10px] font-medium text-zinc-500">LinkedIn</span></div> <div class="flex flex-col items-center gap-1.5"><div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-sm transition-transform hover:scale-110"><!></div> <span class="text-[10px] font-medium text-zinc-500">Email</span></div> <div class="flex flex-col items-center gap-1.5"><button type="button" class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-all hover:bg-primary-500 "><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"></path></svg></button> <span class="text-[10px] font-medium text-zinc-500">Copy Link</span></div></div></div> <div class="fixed inset-x-0 bottom-0 z-[9999997] overflow-hidden rounded-t-[2rem] bg-white pb-safe lg:hidden" style="box-shadow: 0px -8px 40px rgba(0, 0, 0, 0.12);"><div class="flex justify-center pt-3"><div class="h-1.5 w-12 rounded-full bg-zinc-200"></div></div> <div class="flex items-center justify-between px-6 py-4"><h3 class="text-lg font-bold text-zinc-900">Share Product</h3> <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 active:bg-zinc-200"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-6 w-6"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path></svg></button></div> <div class="grid grid-cols-4 items-start justify-items-center gap-y-6 px-4 pb-12 pt-2"><button type="button" class="group flex flex-col items-center gap-2 focus:outline-none"><div class="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 group-active:scale-95 transition-all"><img alt="Copy Link" class="h-7 w-7 opacity-80"/></div> <span class="text-xs font-medium text-zinc-600">Copy Link</span></button> <!></div></div>`, 1);
var root_2 = $.from_html(`<div class="relative max-w-max"><button type="button" aria-label="Open Share Options"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"></path></svg> <span class="text-sm hidden sm:block font-medium">Share</span></button> <!></div>`);

export default function Share_button($$anchor, $$props) {
	$.push($$props, true);

	let showDropDown = $.state(false);

	let socialSharesList = [
		{
			icon: whatsappIcon,
			title: 'Whatsapp',
			dataAction: 'share/whatsapp/share',
			href: `whatsapp://send?text=${$$props.productName} ${$$props.url}`
		},

		{
			icon: telegramIcon,
			title: 'Telegram',
			href: `https://telegram.me/share/url?text=${$$props.productName}&url=${$$props.url}`
		},

		{
			icon: facebookIcon,
			title: 'Facebook',
			href: `https://facebook.com/sharer/sharer.php?u=${$$props.url}&quote=${$$props.productName}`
		},

		{
			icon: twitterIcon,
			title: 'X',
			href: `https://twitter.com/intent/tweet/?text=${$$props.productName}&hashtags=${'zapvi'}&via=${'zapvi'}&related=${'mobile cover, mousepad, phone grips, t-shirt, keychain, mobile accessories'}&url=${$$props.url}`
		},

		{
			icon: pinterestIcon,
			title: 'Pinterest',
			href: `https://pinterest.com/pin/create/button/?url=${$$props.url}&media=${$$props.productImage}&description=${$$props.productName}`
		},

		{
			icon: linkedinIcon,
			title: 'LinkedIn',
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${$$props.url}`
		},

		{
			icon: gmailIcon,
			title: 'Gmail',
			href: `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${page.data.store?.email}&su=Take a look at this ${$$props.productName}&body=${$$props.url}`
		}
	];

	const copyToClipboard = (link) => {
		navigator.clipboard.writeText(link);
		toast.success('Link copied');
	};

	var div = root_2();
	var button = $.child(div);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var button_1 = $.first_child(fragment);
			var div_1 = $.sibling(button_1, 2);
			var div_2 = $.child(div_1);
			var button_2 = $.sibling($.child(div_2), 2);

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var div_4 = $.child(div_3);
			var div_5 = $.child(div_4);
			var node_1 = $.child(div_5);

			WhatsApp(node_1, {
				class: 'h-full flex w-full',
				get text() {
					return `${$$props.productName ?? ''} ${$$props.url ?? ''}`;
				}
			});

			$.reset(div_5);
			$.next(2);
			$.reset(div_4);

			var div_6 = $.sibling(div_4, 2);
			var div_7 = $.child(div_6);
			var node_2 = $.child(div_7);

			Telegram(node_2, {
				class: 'h-full flex w-full',
				get text() {
					return $$props.productName;
				},

				get url() {
					return $$props.url;
				}
			});

			$.reset(div_7);
			$.next(2);
			$.reset(div_6);

			var div_8 = $.sibling(div_6, 2);
			var div_9 = $.child(div_8);
			var node_3 = $.child(div_9);

			Facebook(node_3, {
				class: 'h-full flex w-full',
				get quote() {
					return $$props.productName;
				},

				get url() {
					return $$props.url;
				}
			});

			$.reset(div_9);
			$.next(2);
			$.reset(div_8);

			var div_10 = $.sibling(div_8, 2);
			var div_11 = $.child(div_10);
			var node_4 = $.child(div_11);

			X(node_4, {
				class: 'h-full flex w-full',
				get text() {
					return $$props.productName;
				},

				get url() {
					return $$props.url;
				},
				hashtags: 'zapvi',
				via: 'zapvi',
				related: 'mobile cover, mousepad, phone grips, t-shirt, keychain, mobile accessories'
			});

			$.reset(div_11);
			$.next(2);
			$.reset(div_10);

			var div_12 = $.sibling(div_10, 2);
			var div_13 = $.child(div_12);
			var node_5 = $.child(div_13);

			Pinterest(node_5, {
				class: 'h-full flex w-full',
				get url() {
					return $$props.url;
				},

				get media() {
					return $$props.productImage;
				},

				get description() {
					return $$props.productName;
				}
			});

			$.reset(div_13);
			$.next(2);
			$.reset(div_12);

			var div_14 = $.sibling(div_12, 2);
			var div_15 = $.child(div_14);
			var node_6 = $.child(div_15);

			LinkedIn(node_6, {
				class: 'h-full flex w-full',
				get url() {
					return $$props.url;
				}
			});

			$.reset(div_15);
			$.next(2);
			$.reset(div_14);

			var div_16 = $.sibling(div_14, 2);
			var div_17 = $.child(div_16);
			var node_7 = $.child(div_17);

			Email(node_7, {
				class: 'h-full flex w-full',
				get subject() {
					return `Check this out: ${$$props.productName ?? ''}`;
				},

				get body() {
					return $$props.url;
				}
			});

			$.reset(div_17);
			$.next(2);
			$.reset(div_16);

			var div_18 = $.sibling(div_16, 2);
			var button_3 = $.child(div_18);

			$.next(2);
			$.reset(div_18);
			$.reset(div_3);
			$.reset(div_1);

			var div_19 = $.sibling(div_1, 2);
			var div_20 = $.sibling($.child(div_19), 2);
			var button_4 = $.sibling($.child(div_20), 2);

			$.reset(div_20);

			var div_21 = $.sibling(div_20, 2);
			var button_5 = $.child(div_21);
			var div_22 = $.child(button_5);
			var img = $.only_child(div_22);

			$.next(2);
			$.reset(button_5);

			var node_8 = $.sibling(button_5, 2);

			$.each(node_8, 17, () => socialSharesList, $.index, ($$anchor, ss) => {
				var a = root();
				var div_23 = $.child(a);
				var img_1 = $.only_child(div_23);
				var span = $.sibling(div_23, 2);
				var text = $.only_child(span, true);

				$.reset(a);

				$.template_effect(
					($0) => {
						$.set_attribute(a, 'href', $0);
						$.set_attribute(a, 'data-action', $.get(ss).dataAction || '');
						$.set_attribute(img_1, 'src', $.get(ss).icon);
						$.set_attribute(img_1, 'alt', $.get(ss).title);
						$.set_text(text, $.get(ss).title);
					},
					[() => encodeURI($.get(ss).href)]
				);

				$.delegated('click', a, () => $.set(showDropDown, false));
				$.append($$anchor, a);
			});

			$.reset(div_21);
			$.reset(div_19);
			$.template_effect(() => $.set_attribute(img, 'src', linkIcon));
			$.delegated('click', button_1, () => $.set(showDropDown, false));
			$.transition(3, button_1, () => fade, () => ({ duration: 200 }));
			$.delegated('click', button_2, () => $.set(showDropDown, false));
			$.delegated('click', button_3, () => copyToClipboard($$props.url));
			$.transition(3, div_1, () => fly, () => ({ y: -10, duration: 300 }));
			$.delegated('click', button_4, () => $.set(showDropDown, false));

			$.delegated('click', button_5, () => {
				copyToClipboard($$props.url);
				$.set(showDropDown, false);
			});

			$.transition(3, div_19, () => fly, () => ({ y: '100%', duration: 400, opacity: 1 }));
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(showDropDown)) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(() => $.set_class(button, 1, `group flex items-center gap-2 rounded-full sm:border border-zinc-200 px-3 py-1.5 transition-all duration-300 hover:border-primary-500 hover:text-primary-500 focus:outline-none sm:focus:ring-2 sm:focus:ring-primary-500 sm:focus:ring-offset-2 lg:px-4
		${$.get(showDropDown)
		? 'sm:bg-zinc-900 sm:text-white sm:border-zinc-900 sm:ring-2 sm:ring-primary-500 sm:ring-offset-2'
		: 'bg-white text-zinc-700'}
		`));

	$.delegated('click', button, () => $.set(showDropDown, !$.get(showDropDown)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);