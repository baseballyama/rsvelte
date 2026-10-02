import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Award, RotateCcw, ShieldCheck } from '@lucide/svelte';

var root = $.from_html(`<div class="grid grid-cols-3 gap-2"><div class="flex flex-col items-center justify-center gap-2.5 rounded-md border border-gray-100 bg-gray-50/50 py-4 text-center transition-all"><!> <div class="flex flex-col gap-1"><span class="text-sm font-bold uppercase leading-none tracking-tight text-gray-900">100% Secure</span> <span class="text-xs font-medium uppercase leading-none tracking-tighter text-gray-400">Payments</span></div></div> <div class="flex flex-col items-center justify-center gap-2.5 rounded-md border border-gray-100 bg-gray-50/50 py-4 text-center transition-all"><!> <div class="flex flex-col gap-1"><span class="text-sm font-bold uppercase leading-none tracking-tight text-gray-900">Easy</span> <span class="text-xs font-medium uppercase leading-none tracking-tighter text-gray-400">Returns</span></div></div> <div class="flex flex-col items-center justify-center gap-2.5 rounded-md border border-gray-100 bg-gray-50/50 py-4 text-center transition-all"><!> <div class="flex flex-col gap-1"><span class="text-sm font-bold uppercase leading-none tracking-tight text-gray-900">Quality</span> <span class="text-xs font-medium uppercase leading-none tracking-tighter text-gray-400">Assurance</span></div></div></div>`);

export default function Order_trust_badges($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	ShieldCheck(node, { class: 'h-10 w-10 text-gray-400', strokeWidth: 1.5 });
	$.next(2);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	RotateCcw(node_1, { class: 'h-10 w-10 text-gray-400', strokeWidth: 1.5 });
	$.next(2);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Award(node_2, { class: 'h-10 w-10 text-gray-400', strokeWidth: 1.5 });
	$.next(2);
	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
}