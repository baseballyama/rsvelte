import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { onMount } from 'svelte';
import Button from '$lib/components/button.svelte';
import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
import { scale } from 'svelte/transition';
import { UseAutoScroll } from '$lib/hooks/use-auto-scroll.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'children',
	'class'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div class="relative"><div><!></div> <!></div>`);

export default function Chat_list($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	// Prevents movement on page load
	let canScrollSmooth = $.state(false);

	const autoScroll = new UseAutoScroll();

	onMount(() => {
		$.set(canScrollSmooth, true);
	});

	var div = root_1();
	var div_1 = $.child(div);

	$.attribute_effect(div_1, ($0) => ({ ...rest, class: $0 }), [
		() => cn('no-scrollbar flex h-full w-full flex-col gap-4 overflow-y-auto p-4', $$props.class, { 'scroll-smooth': $.get(canScrollSmooth) })
	]);

	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => ref($$value), () => ref());
	$.bind_this(div_1, ($$value) => autoScroll.ref = $$value, () => autoScroll?.ref);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_2 = $.child(div_2);

			Button(node_2, {
				onclick: () => autoScroll.scrollToBottom(),
				variant: 'outline',
				size: 'icon',
				class: 'absolute bottom-2 left-1/2 inline-flex -translate-x-1/2 transform rounded-full shadow-md',
				children: ($$anchor, $$slotProps) => {
					ArrowDownIcon($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.transition(1, div_2, () => scale, () => ({ start: 0.85, duration: 100, delay: 250 }));
			$.transition(2, div_2, () => scale, () => ({ start: 0.85, duration: 100 }));
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if (!autoScroll.isAtBottom) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}