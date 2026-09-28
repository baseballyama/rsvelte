import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { goto } from '$app/navigation';
import { appendOneTimeCartId, cn } from '$lib/core/utils/index.js';

var root = $.from_html(`<div>1</div> <span>Cart</span>`, 1);
var root_1 = $.from_html(`<div>2</div> <span>Address</span>`, 1);
var root_2 = $.from_html(`<div>3</div> <span>Payment</span>`, 1);
var root_3 = $.from_html(`<div>4</div> <span>Placed</span>`, 1);
var root_4 = $.from_html(`<div class="mb-8"><div class="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-8"><!> <div class="h-px w-4 bg-gray-200 sm:w-8 md:w-16"></div> <!> <div class="h-px w-4 bg-gray-200 sm:w-8 md:w-16"></div> <!> <div class="h-px w-4 bg-gray-200 sm:w-8 md:w-16"></div> <!></div></div>`);

export default function Checkout_header($$anchor, $$props) {
	$.push($$props, true);

	let step = $.prop($$props, 'step', 3, 1);
	var div = root_4();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => step() === 1 || step() === 4);
		let $1 = $.derived(() => cn('flex h-auto items-center p-0 font-normal disabled:opacity-100', step() === 1 ? 'text-primary' : 'text-inherit'));

		Button(node, {
			variant: 'plain',
			get disabled() {
				return $.get($0);
			},
			onclick: () => goto(appendOneTimeCartId('/checkout/cart')),
			get class() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var div_2 = $.first_child(fragment);
				var span = $.sibling(div_2, 2);

				$.template_effect(
					($0) => {
						$.set_class(div_2, 1, $0);
						$.set_class(span, 1, `ml-2 text-xs font-bold uppercase tracking-widest ${step() === 1 ? '' : 'hidden sm:inline'}`);
					},
					[
						() => $.clsx(cn('flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold tracking-tight', step() === 1
							? 'bg-primary border-primary text-primary-foreground'
							: 'border-gray-200'))
					]
				);

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	var node_1 = $.sibling(node, 4);

	{
		let $0 = $.derived(() => step() === 1 || step() === 4);

		let $1 = $.derived(() => cn('flex h-auto items-center p-0 font-normal hover:bg-transparent disabled:opacity-100', step() === 2
			? 'text-primary'
			: step() === 1 ? 'text-gray-400 hover:text-gray-900' : 'text-inherit'));

		Button(node_1, {
			variant: 'plain',
			get disabled() {
				return $.get($0);
			},
			onclick: () => goto(appendOneTimeCartId('/checkout/address')),
			get class() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var div_3 = $.first_child(fragment_1);
				var span_1 = $.sibling(div_3, 2);

				$.template_effect(
					($0) => {
						$.set_class(div_3, 1, $0);
						$.set_class(span_1, 1, `ml-2 text-xs font-bold uppercase tracking-widest ${step() === 2 ? '' : 'hidden sm:inline'}`);
					},
					[
						() => $.clsx(cn('flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold tracking-tight', step() === 2
							? 'bg-primary border-primary text-primary-foreground'
							: 'border-gray-200'))
					]
				);

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	var node_2 = $.sibling(node_1, 4);

	{
		let $0 = $.derived(() => cn('flex h-auto items-center p-0 font-normal hover:bg-transparent disabled:opacity-100', step() === 3 ? 'text-primary' : 'text-gray-400'));

		Button(node_2, {
			variant: 'plain',
			disabled: true,
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_2();
				var div_4 = $.first_child(fragment_2);
				var span_2 = $.sibling(div_4, 2);

				$.template_effect(
					($0) => {
						$.set_class(div_4, 1, $0);
						$.set_class(span_2, 1, `ml-2 text-xs font-bold uppercase tracking-widest ${step() === 3 ? '' : 'hidden sm:inline'}`);
					},
					[
						() => $.clsx(cn('flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold tracking-tight', step() === 3
							? 'bg-primary border-primary text-primary-foreground'
							: 'border-gray-200'))
					]
				);

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node_2, 4);

	{
		let $0 = $.derived(() => cn('flex h-auto items-center p-0 font-normal hover:bg-transparent disabled:opacity-100', step() === 4 ? 'text-primary' : 'text-gray-400'));

		Button(node_3, {
			variant: 'plain',
			disabled: true,
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_3();
				var div_5 = $.first_child(fragment_3);
				var span_3 = $.sibling(div_5, 2);

				$.template_effect(
					($0) => {
						$.set_class(div_5, 1, $0);
						$.set_class(span_3, 1, `ml-2 text-xs font-bold uppercase tracking-widest ${step() === 4 ? '' : 'hidden sm:inline'}`);
					},
					[
						() => $.clsx(cn('flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold tracking-tight', step() === 4
							? 'bg-primary border-primary text-primary-foreground'
							: 'border-gray-200'))
					]
				);

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}