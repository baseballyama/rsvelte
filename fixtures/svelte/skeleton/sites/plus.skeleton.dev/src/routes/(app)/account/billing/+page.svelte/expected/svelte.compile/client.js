import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import PageHeader from '$lib/components/layout/page-header.svelte';
import { ArrowDownIcon } from '@lucide/svelte';
import VisaIcon from 'virtual:icons/simple-icons/visa';

var root = $.from_html(`<tr><td> </td><td> </td><td class="font-bold"> </td><td><span class="text-xs opacity-60"> </span></td><td class="text-right"><button type="button" class="btn preset-outlined-surface-200-800"><!> <span>Receipt</span></button></td></tr>`);
var root_1 = $.from_html(`<div><!> <div class="container-page space-y-4"><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><section class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4"><p class="text-xs uppercase opacity-60">Current plan</p> <div class="flex items-center gap-2 text-sm"><h2 class="h3"> </h2> <span class="badge preset-filled-primary-500"> </span></div> <p class="opacity-60"> </p> <button type="button" class="btn preset-filled">Upgrade to Team</button></section> <section class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4"><h2 class="h3">Payment method</h2> <div class="flex items-center justify-between gap-4"><div class="flex items-center gap-3"><!> <div><p class="font-mono"> </p> <p class="text-xs opacity-60"> </p></div></div> <button type="button" class="btn preset-outlined-surface-200-800">Update</button></div> <hr class="hr"/> <div class="flex justify-between items-center gap-4"><div class="space-y-1"><p class="text-xs font-bold">Tax / VAT</p> <p class="opacity-60">No tax info on file</p></div> <a class="btn preset-outlined-surface-200-800">Add</a></div></section></div> <section class="card bg-surface-50-950 border border-surface-200-800 p-4 space-y-4"><div class="flex items-center justify-between gap-4"><h2 class="h3">Purchases</h2> <button type="button" class="btn preset-outlined-surface-200-800">Download all</button></div> <div class="table-wrap"><table class="table caption-bottom"><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th class="text-right!"></th></tr></thead><tbody></tbody></table></div></section></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const currentPlan = {
		tier: 'Individual',
		badge: 'PLUS',
		summary: 'Lifetime access · purchased Jan 14, 2026 · $XX USD'
	};

	const paymentMethod = {
		brand: 'Visa',
		Icon: VisaIcon,
		last4: '4242',
		expiry: '09/29'
	};

	const purchases = [
		{
			date: 'Jan 14, 2026',
			description: 'Plus - Individual',
			amount: '$XX.XX',
			status: 'PAID'
		},

		{
			date: 'Aug 02, 2025',
			description: 'Theme Pack - Cosmic',
			amount: '$XX.XX',
			status: 'PAID'
		},

		{
			date: 'Mar 21, 2025',
			description: 'UI Kit Add-on',
			amount: '$XX.XX',
			status: 'PAID'
		},

		{
			date: 'Nov 10, 2024',
			description: 'Tempalte - Portfolio',
			amount: '$XX.XX',
			status: 'PAID'
		}
	];

	var div = root_1();
	var node = $.child(div);

	PageHeader(node, { title: 'Billing' });

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var section = $.child(div_2);
	var div_3 = $.sibling($.child(section), 2);
	var h2 = $.child(div_3);
	var text = $.only_child(h2, true);
	var span = $.sibling(h2, 2);
	var text_1 = $.only_child(span, true);

	$.reset(div_3);

	var p = $.sibling(div_3, 2);
	var text_2 = $.only_child(p, true);

	$.next(2);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_4 = $.sibling($.child(section_1), 2);
	var div_5 = $.child(div_4);
	var node_1 = $.child(div_5);

	$.component(node_1, () => paymentMethod.Icon, ($$anchor, paymentMethod_Icon) => {
		paymentMethod_Icon($$anchor, {
			class: 'size-10',
			get 'aria-label'() {
				return paymentMethod.brand;
			}
		});
	});

	var div_6 = $.sibling(node_1, 2);
	var p_1 = $.child(div_6);
	var text_3 = $.only_child(p_1);
	var p_2 = $.sibling(p_1, 2);
	var text_4 = $.only_child(p_2);

	$.reset(div_6);
	$.reset(div_5);
	$.next(2);
	$.reset(div_4);

	var div_7 = $.sibling(div_4, 4);
	var a = $.sibling($.child(div_7), 2);

	$.reset(div_7);
	$.reset(section_1);
	$.reset(div_2);

	var section_2 = $.sibling(div_2, 2);
	var div_8 = $.sibling($.child(section_2), 2);
	var table = $.child(div_8);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => purchases, ({ date, description, amount, status }) => date + description, ($$anchor, $$item) => {
		let date = () => $.get($$item).date;
		let description = () => $.get($$item).description;
		let amount = () => $.get($$item).amount;
		let status = () => $.get($$item).status;
		var tr = root();
		var td = $.child(tr);
		var text_5 = $.only_child(td, true);
		var td_1 = $.sibling(td);
		var text_6 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_7 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var span_1 = $.child(td_3);
		var text_8 = $.only_child(span_1, true);

		$.reset(td_3);

		var td_4 = $.sibling(td_3);
		var button = $.child(td_4);
		var node_2 = $.child(button);

		ArrowDownIcon(node_2, { class: 'size-elem-sm' });
		$.next(2);
		$.reset(button);
		$.reset(td_4);
		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text_5, date());
			$.set_text(text_6, description());
			$.set_text(text_7, amount());
			$.set_text(text_8, status());
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div_8);
	$.reset(section_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text, currentPlan.tier);
			$.set_text(text_1, currentPlan.badge);
			$.set_text(text_2, currentPlan.summary);
			$.set_text(text_3, `•••• •••• •••• ${paymentMethod.last4 ?? ''}`);
			$.set_text(text_4, `Exp ${paymentMethod.expiry ?? ''}`);
			$.set_attribute(a, 'href', $0);
		},
		[() => resolve('/account/billing')]
	);

	$.append($$anchor, div);
	$.pop();
}