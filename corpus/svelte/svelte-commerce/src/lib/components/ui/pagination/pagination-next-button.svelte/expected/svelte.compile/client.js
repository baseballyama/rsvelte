import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination as PaginationPrimitive } from 'bits-ui';
import { ChevronRight } from '@lucide/svelte';
import { cn } from '$lib/core/utils';
import { buttonVariants } from '$lib/components/ui/button/index.js';

const Fallback = ($$anchor) => {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	ChevronRight(node, { class: 'size-4' });
	$.append($$anchor, fragment);
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<span>Next</span> <!>`, 1);

export default function Pagination_next_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment_1 = $.comment();
	var node_1 = $.first_child(fragment_1);

	{
		let $0 = $.derived(() => cn(buttonVariants({ variant: 'ghost', className: 'gap-1 pr-2.5' }), $$props.class));
		let $1 = $.derived(() => $$props.children || Fallback);

		$.component(node_1, () => PaginationPrimitive.NextButton, ($$anchor, PaginationPrimitive_NextButton) => {
			PaginationPrimitive_NextButton($$anchor, $.spread_props(() => restProps, {
				get class() {
					return $.get($0);
				},

				get children() {
					return $.get($1);
				},

				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				}
			}));
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}