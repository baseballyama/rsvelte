import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button/button.svelte';
import { MyProfileDeleteModule } from '$lib/core/composables/index.js';

var root = $.from_html(`<div class="mx-auto max-w-3xl py-8 md:py-12"><div class="mb-10"><h1 class="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Delete Account</h1> <p class="mt-2 text-lg text-gray-500">We're sorry to see you go. Please review the following information carefully.</p></div> <div class="overflow-hidden rounded-md border border-red-100 bg-white shadow-xl shadow-red-500/5"><div class="bg-red-50/50 p-6 md:p-8"><h2 class="text-xl font-bold text-red-600">Is this goodbye?</h2> <p class="mt-2 text-sm font-medium text-red-600/70">Are you sure you want to delete your account? This action is permanent.</p></div> <div class="p-6 md:p-8"><ul class="space-y-6"><li class="flex gap-4"><div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">1</div> <div class="space-y-1"><p class="font-bold text-gray-900">Forfeit all benefits</p> <p class="text-sm leading-relaxed text-gray-500">You'll lose your order history, saved details, coupons, and benefits. These cannot be recovered. Please review our <a href="/privacy-policy" class="font-semibold text-primary hover:underline">Privacy Policy</a>.</p></div></li> <li class="flex gap-4"><div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">2</div> <div class="space-y-1"><p class="font-bold text-gray-900">Pending Transactions</p> <p class="text-sm leading-relaxed text-gray-500">Any pending orders, exchanges, returns, or refunds will no longer be accessible via your account. We will attempt to complete open
							transactions within 30 days.</p></div></li> <li class="flex gap-4"><div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">3</div> <div class="space-y-1"><p class="font-bold text-gray-900">Coupon Restrictions</p> <p class="text-sm leading-relaxed text-gray-500">We may not extend New User coupons if a new account is created with the same mobile number or email ID.</p></div></li> <li class="flex gap-4"><div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">4</div> <div class="space-y-1"><p class="font-bold text-gray-900">Data Retention</p> <p class="text-sm leading-relaxed text-gray-500">Certain data may be retained for legitimate reasons such as security, fraud prevention, and regulatory compliance.</p></div></li></ul> <div class="mt-12 flex items-center gap-3 rounded-md bg-gray-50 p-4"><input type="checkbox" id="deleteAccount" class="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"/> <label for="deleteAccount" class="text-sm font-semibold text-gray-700">I understand and agree to all the terms and conditions*</label></div> <div class="mt-8 flex justify-end"><!></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const deleteModule = new MyProfileDeleteModule();
	var div = root();

	$.head('y37px5', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Delete Account | Svelte Commerce';
		});
	});

	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.sibling($.child(div_2), 2);
	var input = $.child(div_3);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node = $.child(div_4);

	{
		let $0 = $.derived(() => !deleteModule.iAgree);

		Button(node, {
			get onclick() {
				return deleteModule.deleteUser;
			},
			variant: 'destructive',
			class: 'h-12 px-10',
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Permanently Delete My Account');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_4);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.bind_checked(input, () => deleteModule.iAgree, ($$value) => deleteModule.iAgree = $$value);
	$.append($$anchor, div);
	$.pop();
}