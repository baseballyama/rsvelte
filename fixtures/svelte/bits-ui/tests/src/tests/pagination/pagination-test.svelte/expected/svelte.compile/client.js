import 'svelte/internal/disclose-version';
import { Pagination } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'count', 'perPage']);
var root = $.from_html(`<span>&LeftArrow;</span>`);
var root_1 = $.from_html(`<span>...</span>`);
var root_2 = $.from_html(`<span>&RightArrow;;</span>`);
var root_3 = $.from_html(`<p data-testid="current-page"> </p> <p data-testid="range-start"> </p> <p data-testid="range-end"> </p> <p data-testid="range"> </p> <div><!> <!> <!></div>`, 1);
var root_4 = $.from_html(`<main><!></main>`);

export default function Pagination_test($$anchor, $$props) {
	let count = $.prop($$props, 'count', 3, 100),
		perPage = $.prop($$props, 'perPage', 3, 10),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_4();
	var node = $.child(main);

	{
		const children = ($$anchor, $$arg0) => {
			let pages = () => ($$arg0?.()).pages;
			let range = () => ($$arg0?.()).range;
			let currentPage = () => ($$arg0?.()).currentPage;
			var fragment = root_3();
			var p = $.first_child(fragment);
			var text = $.only_child(p, true);
			var p_1 = $.sibling(p, 2);
			var text_1 = $.only_child(p_1, true);
			var p_2 = $.sibling(p_1, 2);
			var text_2 = $.only_child(p_2, true);
			var p_3 = $.sibling(p_2, 2);
			var text_3 = $.only_child(p_3);
			var div = $.sibling(p_3, 2);
			var node_1 = $.child(div);

			$.component(node_1, () => Pagination.PrevButton, ($$anchor, Pagination_PrevButton) => {
				Pagination_PrevButton($$anchor, {
					'data-testid': 'prev-button',
					children: ($$anchor, $$slotProps) => {
						var span = root();

						$.append($$anchor, span);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, pages, (page) => page.key, ($$anchor, page) => {
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var span_1 = root_1();

						$.append($$anchor, span_1);
					};

					var consequent_1 = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_4 = $.first_child(fragment_2);

						$.component(node_4, () => Pagination.Page, ($$anchor, Pagination_Page) => {
							Pagination_Page($$anchor, {
								get page() {
									return $.get(page);
								},

								get 'data-testid'() {
									return `page-${$.get(page).value ?? ''}`;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text();

									$.template_effect(() => $.set_text(text_4, $.get(page).value));
									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					$.if(node_3, ($$render) => {
						if ($.get(page).type === "ellipsis") $$render(consequent); else if ($.get(page).type === "page") $$render(consequent_1, 1);
					});
				}

				$.append($$anchor, fragment_1);
			});

			var node_5 = $.sibling(node_2, 2);

			$.component(node_5, () => Pagination.NextButton, ($$anchor, Pagination_NextButton) => {
				Pagination_NextButton($$anchor, {
					'data-testid': 'next-button',
					children: ($$anchor, $$slotProps) => {
						var span_2 = root_2();

						$.append($$anchor, span_2);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, currentPage());
				$.set_text(text_1, range().start);
				$.set_text(text_2, range().end);
				$.set_text(text_3, `Showing items ${range().start ?? ''} - ${range().end ?? ''}`);
			});

			$.append($$anchor, fragment);
		};

		$.component(node, () => Pagination.Root, ($$anchor, Pagination_Root) => {
			Pagination_Root($$anchor, $.spread_props(
				{
					'data-testid': 'root',
					get count() {
						return count();
					},

					get perPage() {
						return perPage();
					}
				},
				() => restProps,
				{ children, $$slots: { default: true } }
			));
		});
	}

	$.reset(main);
	$.append($$anchor, main);
}