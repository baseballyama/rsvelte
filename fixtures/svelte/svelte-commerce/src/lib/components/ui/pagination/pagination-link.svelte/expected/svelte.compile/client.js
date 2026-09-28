import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination as PaginationPrimitive } from 'bits-ui';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'size',
	'isActive',
	'page',
	'children'
]);

export default function Pagination_link($$anchor, $$props) {
	$.push($$props, true);

	const Fallback = ($$anchor) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $$props.page.value));
		$.append($$anchor, text);
	};

	let ref = $.prop($$props, 'ref', 15, null),
		size = $.prop($$props, 'size', 3, 'icon'),
		isActive = $.prop($$props, 'isActive', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment_1 = $.comment();
	var node = $.first_child(fragment_1);

	{
		let $0 = $.derived(() => isActive() ? 'page' : undefined);
		let $1 = $.derived(() => cn(buttonVariants({ variant: isActive() ? 'default' : 'ghost', size: size() }), $$props.class));
		let $2 = $.derived(() => $$props.children || Fallback);

		$.component(node, () => PaginationPrimitive.Page, ($$anchor, PaginationPrimitive_Page) => {
			PaginationPrimitive_Page($$anchor, $.spread_props(
				{
					get page() {
						return $$props.page;
					},

					get 'aria-current'() {
						return $.get($0);
					},

					get class() {
						return $.get($1);
					}
				},
				() => restProps,
				{
					get children() {
						return $.get($2);
					},

					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}