import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SectionHeading from './section-heading.svelte';
import { resolveTiles } from './utils.js';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<a><img/> <!> <!></a>`);
var root_2 = $.from_html(`<figcaption> </figcaption>`);
var root_3 = $.from_html(`<figure><img/> <!></figure>`);
var root_4 = $.from_html(`<div></div>`);
var root_5 = $.from_html(`<section><!> <!></section>`);

export default function Tile_grid($$anchor, $$props) {
	$.push($$props, true);

	const /**
	 * A grid of picture tiles — category bands, seasonal edits, campaign pairs, lookbook
	 * galleries. All of those were separate hand-written blocks in every theme; the differences
	 * were the tile source, the column count and where the caption sits, so they are options.
	 *
	 * caption: 'overlay' (label over the image) | 'below' (figcaption) | 'none'
	 */
	tileMarkup = ($$anchor, tile = $.noop) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_2 = ($$anchor) => {
				var a = root_1();
				var img = $.child(a);
				var node_1 = $.sibling(img, 2);

				{
					var consequent = ($$anchor) => {
						var span = root();
						var text = $.only_child(span, true);

						$.template_effect(() => $.set_text(text, tile().title));
						$.append($$anchor, span);
					};

					$.if(node_1, ($$render) => {
						if ($.get(caption) === 'overlay' && tile().title) $$render(consequent);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				{
					var consequent_1 = ($$anchor) => {
						var span_1 = root();
						var text_1 = $.only_child(span_1, true);

						$.template_effect(() => $.set_text(text_1, tile().title));
						$.append($$anchor, span_1);
					};

					$.if(node_2, ($$render) => {
						if ($.get(caption) === 'below' && tile().title) $$render(consequent_1);
					});
				}

				$.reset(a);

				$.template_effect(() => {
					$.set_class(a, 1, `ts-tile ${options().tileClass ?? '' ?? ''}`);
					$.set_attribute(a, 'href', tile().href);
					$.set_attribute(img, 'src', tile().image);
					$.set_attribute(img, 'alt', tile().imageAlt || tile().title || '');
				});

				$.append($$anchor, a);
			};

			var alternate = ($$anchor) => {
				var figure = root_3();
				var img_1 = $.child(figure);
				var node_3 = $.sibling(img_1, 2);

				{
					var consequent_3 = ($$anchor) => {
						var figcaption = root_2();
						var text_2 = $.only_child(figcaption, true);

						$.template_effect(() => $.set_text(text_2, tile().title));
						$.append($$anchor, figcaption);
					};

					$.if(node_3, ($$render) => {
						if ($.get(caption) !== 'none' && tile().title) $$render(consequent_3);
					});
				}

				$.reset(figure);

				$.template_effect(() => {
					$.set_class(figure, 1, `ts-tile ${options().tileClass ?? '' ?? ''}`);
					$.set_attribute(img_1, 'src', tile().image);
					$.set_attribute(img_1, 'alt', tile().imageAlt || tile().title || '');
				});

				$.append($$anchor, figure);
			};

			$.if(node, ($$render) => {
				if (tile().href) $$render(consequent_2); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	let options = $.prop($$props, 'options', 19, () => ({}));
	const tiles = $.derived(() => resolveTiles($$props.ctx, options()));
	const caption = $.derived(() => options().caption ?? 'overlay');
	const hasHeading = $.derived(() => !!(options().heading && Object.keys(options().heading).length));
	var fragment_1 = $.comment();
	var node_4 = $.first_child(fragment_1);

	{
		var consequent_6 = ($$anchor) => {
			var section = root_5();
			var node_5 = $.child(section);

			{
				var consequent_4 = ($$anchor) => {
					SectionHeading($$anchor, {
						get ctx() {
							return $$props.ctx;
						},

						get options() {
							return options().heading;
						}
					});
				};

				$.if(node_5, ($$render) => {
					if ($.get(hasHeading)) $$render(consequent_4);
				});
			}

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div = root_4();

					$.each(div, 23, () => $.get(tiles), (tile, index) => tile.href ?? index, ($$anchor, tile) => {
						tileMarkup($$anchor, () => $.get(tile));
					});

					$.reset(div);
					$.template_effect(() => $.set_class(div, 1, `ts-tiles ${options().gridClass ?? '' ?? ''}`));
					$.append($$anchor, div);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_7 = $.first_child(fragment_4);

					$.each(node_7, 19, () => $.get(tiles), (tile, index) => tile.href ?? index, ($$anchor, tile) => {
						tileMarkup($$anchor, () => $.get(tile));
					});

					$.append($$anchor, fragment_4);
				};

				$.if(node_6, ($$render) => {
					if ($.get(hasHeading) || options().gridClass) $$render(consequent_5); else $$render(alternate_1, -1);
				});
			}

			$.reset(section);
			$.template_effect(() => $.set_class(section, 1, `ts-tile-grid ${options().class ?? '' ?? ''}`));
			$.append($$anchor, section);
		};

		$.if(node_4, ($$render) => {
			if ($.get(tiles).length) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}