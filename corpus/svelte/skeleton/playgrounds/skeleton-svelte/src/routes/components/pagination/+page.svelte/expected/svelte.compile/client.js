import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	Pagination($$anchor, {
		count: 5000,
		pageSize: 10,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Pagination.FirstTrigger, ($$anchor, Pagination_FirstTrigger) => {
				Pagination_FirstTrigger($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('First');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Pagination.PrevTrigger, ($$anchor, Pagination_PrevTrigger) => {
				Pagination_PrevTrigger($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Prev');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			{
				const children = ($$anchor, pagination = $.noop) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.each(node_3, 18, () => pagination()().pages, (page) => page, ($$anchor, page, index) => {
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

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, page.value));
											$.append($$anchor, text_2);
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

											var text_3 = $.text('…');

											$.append($$anchor, text_3);
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
						$.next();

						var text_4 = $.text('Next');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			});

			var node_8 = $.sibling(node_7, 2);

			$.component(node_8, () => Pagination.LastTrigger, ($$anchor, Pagination_LastTrigger) => {
				Pagination_LastTrigger($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Last');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}