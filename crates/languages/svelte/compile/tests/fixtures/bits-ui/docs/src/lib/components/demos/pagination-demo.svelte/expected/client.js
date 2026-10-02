import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination } from "bits-ui";
import CaretLeft from "phosphor-svelte/lib/CaretLeft";
import CaretRight from "phosphor-svelte/lib/CaretRight";

var root = $.from_html(`<div class="text-foreground-alt select-none text-[15px] font-medium">...</div>`);
var root_1 = $.from_html(`<div class="my-8 flex items-center"><!> <div class="flex items-center gap-2.5"></div> <!></div> <p class="text-muted-foreground text-center text-[13px]"> </p>`, 1);

export default function Pagination_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let pages = () => ($$arg0?.()).pages;
			let range = () => ($$arg0?.()).range;
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			$.component(node_1, () => Pagination.PrevButton, ($$anchor, Pagination_PrevButton) => {
				Pagination_PrevButton($$anchor, {
					class: 'hover:bg-dark-10 disabled:text-muted-foreground mr-[25px] inline-flex size-10 items-center justify-center rounded-[9px] bg-transparent active:scale-[0.98] disabled:cursor-not-allowed hover:disabled:bg-transparent',
					children: ($$anchor, $$slotProps) => {
						CaretLeft($$anchor, { class: 'size-6' });
					},
					$$slots: { default: true }
				});
			});

			var div_1 = $.sibling(node_1, 2);

			$.each(div_1, 21, pages, (page) => page.key, ($$anchor, page) => {
				var fragment_3 = $.comment();
				var node_2 = $.first_child(fragment_3);

				{
					var consequent = ($$anchor) => {
						var div_2 = root();

						$.append($$anchor, div_2);
					};

					var alternate = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_3 = $.first_child(fragment_4);

						$.component(node_3, () => Pagination.Page, ($$anchor, Pagination_Page) => {
							Pagination_Page($$anchor, {
								get page() {
									return $.get(page);
								},
								class: 'hover:bg-dark-10 data-selected:bg-foreground data-selected:text-background inline-flex size-10 select-none items-center justify-center rounded-[9px] bg-transparent text-[15px] font-medium active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 hover:disabled:bg-transparent',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(page).value));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					};

					$.if(node_2, ($$render) => {
						if ($.get(page).type === "ellipsis") $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_3);
			});

			$.reset(div_1);

			var node_4 = $.sibling(div_1, 2);

			$.component(node_4, () => Pagination.NextButton, ($$anchor, Pagination_NextButton) => {
				Pagination_NextButton($$anchor, {
					class: 'hover:bg-dark-10 disabled:text-muted-foreground ml-[29px] inline-flex size-10 items-center justify-center rounded-[9px] bg-transparent active:scale-[0.98] disabled:cursor-not-allowed hover:disabled:bg-transparent',
					children: ($$anchor, $$slotProps) => {
						CaretRight($$anchor, { class: 'size-6' });
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);

			var p = $.sibling(div, 2);
			var text_1 = $.only_child(p);

			$.template_effect(() => $.set_text(text_1, `Showing ${range().start ?? ''} - ${range().end ?? ''}`));
			$.append($$anchor, fragment_1);
		};

		$.component(node, () => Pagination.Root, ($$anchor, Pagination_Root) => {
			Pagination_Root($$anchor, {
				count: 100,
				perPage: 10,
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
}