import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Limit from './limit.svelte';
import Pagination from './pagination.svelte';
import { Layout } from '@appwrite.io/pink-svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'limit',
	'offset',
	'total',
	'name',
	'useCreateLink',
	'pageParam',
	'removeOnFirstPage'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function PaginationWithLimit($$anchor, $$props) {
	let useCreateLink = $.prop($$props, 'useCreateLink', 3, true),
		pageParam = $.prop($$props, 'pageParam', 3, 'page'),
		removeOnFirstPage = $.prop($$props, 'removeOnFirstPage', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const showLimit = $.derived(() => !!useCreateLink());
	const direction = $.derived(() => $.get(showLimit) ? 'row' : 'column');
	const alignItems = $.derived(() => $.get(showLimit) ? 'center' : 'flex-end');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, $.spread_props(
			{
				wrap: 'wrap',
				get direction() {
					return $.get(direction);
				},

				get alignItems() {
					return $.get(alignItems);
				},
				justifyContent: 'space-between'
			},
			() => restProps,
			{
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							Limit($$anchor, {
								get limit() {
									return $$props.limit;
								},

								get sum() {
									return $$props.total;
								},

								get name() {
									return $$props.name;
								},

								get pageParam() {
									return pageParam();
								},

								get removeOnFirstPage() {
									return removeOnFirstPage();
								}
							});
						};

						$.if(node_1, ($$render) => {
							if ($.get(showLimit)) $$render(consequent);
						});
					}

					var node_2 = $.sibling(node_1, 2);

					Pagination(node_2, {
						get limit() {
							return $$props.limit;
						},

						get offset() {
							return $$props.offset;
						},

						get sum() {
							return $$props.total;
						},

						get useCreateLink() {
							return useCreateLink();
						},

						get pageParam() {
							return pageParam();
						},

						get removeOnFirstPage() {
							return removeOnFirstPage();
						},

						$$events: {
							page: function ($$arg) {
								$.bubble_event.call(this, $$props, $$arg);
							}
						}
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	});

	$.append($$anchor, fragment);
}