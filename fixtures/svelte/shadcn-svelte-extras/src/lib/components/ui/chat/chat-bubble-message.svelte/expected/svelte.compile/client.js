import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LoadingDots from './loading-dots.svelte';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'typing',
	'class',
	'children'
]);

var root = $.from_html(`<div class="flex size-full place-items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function Chat_bubble_message($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		typing = $.prop($$props, 'typing', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	var div = root_1();

	$.attribute_effect(div, ($0) => ({ ...rest, class: $0 }), [
		() => cn("bg-secondary group-data-[variant='sent']/chat-bubble:bg-primary group-data-[variant='sent']/chat-bubble:text-primary-foreground order-2 rounded-lg p-4 text-sm group-data-[variant='received']/chat-bubble:rounded-bl-none group-data-[variant='sent']/chat-bubble:order-1 group-data-[variant='sent']/chat-bubble:rounded-br-none", $$props.class)
	]);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			LoadingDots(node_1, {});
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (typing()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}