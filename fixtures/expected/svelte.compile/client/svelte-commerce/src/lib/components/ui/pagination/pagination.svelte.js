import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination as PaginationPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'count',
	'perPage',
	'page',
	'siblingCount'
]);

export default function Pagination($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		count = $.prop($$props, 'count', 3, 0),
		perPage = $.prop($$props, 'perPage', 3, 10),
		page = $.prop($$props, 'page', 15, 1),
		siblingCount = $.prop($$props, 'siblingCount', 3, 1),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('mx-auto flex w-full flex-col items-center', $$props.class));

		$.component(node, () => PaginationPrimitive.Root, ($$anchor, PaginationPrimitive_Root) => {
			PaginationPrimitive_Root($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					},

					get count() {
						return count();
					},

					get perPage() {
						return perPage();
					},

					get siblingCount() {
						return siblingCount();
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					get page() {
						return page();
					},

					set page($$value) {
						page($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}