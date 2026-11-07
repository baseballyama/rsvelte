import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SectionHeading from './section-heading.svelte';
import { text } from './utils.js';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<h3> </h3>`);
var root_2 = $.from_html(`<p> </p>`);
var root_3 = $.from_html(`<div><!> <!></div>`);
var root_4 = $.from_html(`<section><!> <!></section>`);

export default function Product_grid($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * A grid of real catalogue products with the theme's own product card, plus the empty state
	 * for a store that has none yet. Never invents products to fill the grid.
	 */
	let options = $.prop($$props, 'options', 19, () => ({}));

	const products = $.derived(() => $$props.ctx.featuredProducts?.slice(0, options().limit ?? 8) ?? []);
	const emptyTitle = $.derived(() => text($$props.ctx, options().empty?.title));
	const emptyText = $.derived(() => text($$props.ctx, options().empty?.text));
	const Card = $.derived(() => $$props.ctx.ProductCard);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_5 = ($$anchor) => {
			var section = root_4();
			var node_1 = $.child(section);

			{
				var consequent = ($$anchor) => {
					SectionHeading($$anchor, {
						get ctx() {
							return $$props.ctx;
						},

						get options() {
							return options().heading;
						}
					});
				};

				$.if(node_1, ($$render) => {
					if (options().heading) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div = root();

					$.each(div, 21, () => $.get(products), (product) => product.id ?? product.slug, ($$anchor, product) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => options().aspectRatio ?? `${$$props.ctx.aspectWidth}:${$$props.ctx.aspectHeight}`);

							$.component(node_3, () => $.get(Card), ($$anchor, Card_1) => {
								Card_1($$anchor, {
									get product() {
										return $.get(product);
									},

									get themeContent() {
										return $$props.ctx.content;
									},

									get aspectRatio() {
										return $.get($0);
									}
								});
							});
						}

						$.append($$anchor, fragment_2);
					});

					$.reset(div);
					$.template_effect(() => $.set_class(div, 1, `ts-products ${options().gridClass ?? '' ?? ''}`));
					$.append($$anchor, div);
				};

				var consequent_4 = ($$anchor) => {
					var div_1 = root_3();
					var node_4 = $.child(div_1);

					{
						var consequent_2 = ($$anchor) => {
							var h3 = root_1();
							var text_1 = $.only_child(h3, true);

							$.template_effect(() => $.set_text(text_1, $.get(emptyTitle)));
							$.append($$anchor, h3);
						};

						$.if(node_4, ($$render) => {
							if ($.get(emptyTitle)) $$render(consequent_2);
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						var consequent_3 = ($$anchor) => {
							var p = root_2();
							var text_2 = $.only_child(p, true);

							$.template_effect(() => $.set_text(text_2, $.get(emptyText)));
							$.append($$anchor, p);
						};

						$.if(node_5, ($$render) => {
							if ($.get(emptyText)) $$render(consequent_3);
						});
					}

					$.reset(div_1);
					$.template_effect(() => $.set_class(div_1, 1, `ts-empty ${options().emptyClass ?? '' ?? ''}`));
					$.append($$anchor, div_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(products).length && $.get(Card)) $$render(consequent_1); else if ($.get(emptyTitle) || $.get(emptyText)) $$render(consequent_4, 1);
				});
			}

			$.reset(section);
			$.template_effect(() => $.set_class(section, 1, `ts-product-grid ${options().class ?? '' ?? ''}`));
			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if ($.get(products).length || !options().requireProducts) $$render(consequent_5);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}