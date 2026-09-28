import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { users } from './data';
import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
import { Pagination } from '@skeletonlabs/skeleton-svelte';

const PAGE_SIZE = 5;
var root = $.from_html(`<tr><td> </td><td> </td><td> </td><td> </td></tr>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid gap-4 w-full place-items-center"><table class="table table-auto"><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Country</th></tr></thead><tbody></tbody></table> <!></div>`);

export default function Dir($$anchor, $$props) {
	$.push($$props, true);

	let page = $.state(1);
	const start = $.derived(() => ($.get(page) - 1) * PAGE_SIZE);
	const end = $.derived(() => $.get(start) + PAGE_SIZE);
	const paginatedUsers = $.derived(() => users.slice($.get(start), $.get(end)));
	var div = root_2();
	var table = $.child(div);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => $.get(paginatedUsers), $.index, ($$anchor, user) => {
		var tr = root();
		var td = $.child(tr);
		var text = $.only_child(td, true);
		var td_1 = $.sibling(td);
		var text_1 = $.only_child(td_1, true);
		var td_2 = $.sibling(td_1);
		var text_2 = $.only_child(td_2, true);
		var td_3 = $.sibling(td_2);
		var text_3 = $.only_child(td_3, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text, $.get(user).id);
			$.set_text(text_1, $.get(user).name);
			$.set_text(text_2, $.get(user).email);
			$.set_text(text_3, $.get(user).country);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);

	var node = $.sibling(table, 2);

	Pagination(node, {
		get count() {
			return users.length;
		},
		pageSize: PAGE_SIZE,
		get page() {
			return $.get(page);
		},
		onPageChange: (event) => $.set(page, event.page, true),
		dir: 'rtl',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Pagination.PrevTrigger, ($$anchor, Pagination_PrevTrigger) => {
				Pagination_PrevTrigger($$anchor, {
					children: ($$anchor, $$slotProps) => {
						ArrowRightIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			{
				const children = ($$anchor, pagination = $.noop) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.each(node_3, 18, () => pagination()().pages, (page) => page, ($$anchor, page, index, $$array) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => Pagination.Item, ($$anchor, Pagination_Item) => {
									Pagination_Item($$anchor, $.spread_props(() => page, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text();

											$.template_effect(() => $.set_text(text_4, page.value));
											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									}));
								});

								$.append($$anchor, fragment_4);
							};

							var alternate = ($$anchor) => {
								var fragment_6 = $.comment();
								var node_6 = $.first_child(fragment_6);

								$.component(node_6, () => Pagination.Ellipsis, ($$anchor, Pagination_Ellipsis) => {
									Pagination_Ellipsis($$anchor, {
										get index() {
											return $.get(index);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('…');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							};

							$.if(node_4, ($$render) => {
								if (page.type === 'page') $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_3);
					});

					$.append($$anchor, fragment_2);
				};

				$.component(node_2, () => Pagination.Context, ($$anchor, Pagination_Context) => {
					Pagination_Context($$anchor, { children, $$slots: { default: true } });
				});
			}

			var node_7 = $.sibling(node_2, 2);

			$.component(node_7, () => Pagination.NextTrigger, ($$anchor, Pagination_NextTrigger) => {
				Pagination_NextTrigger($$anchor, {
					children: ($$anchor, $$slotProps) => {
						ArrowLeftIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}