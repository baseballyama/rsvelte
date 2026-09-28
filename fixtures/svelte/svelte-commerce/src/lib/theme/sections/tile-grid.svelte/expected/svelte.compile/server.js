import * as $ from 'svelte/internal/server';
import SectionHeading from './section-heading.svelte';
import { resolveTiles } from './utils.js';

export default function Tile_grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * A grid of picture tiles — category bands, seasonal edits, campaign pairs, lookbook
		 * galleries. All of those were separate hand-written blocks in every theme; the differences
		 * were the tile source, the column count and where the caption sits, so they are options.
		 *
		 * caption: 'overlay' (label over the image) | 'below' (figcaption) | 'none'
		 */
		let { ctx, options = {} } = $$props;

		const tiles = $.derived(() => resolveTiles(ctx, options));
		const caption = $.derived(() => options.caption ?? 'overlay');
		const hasHeading = $.derived(() => !!(options.heading && Object.keys(options.heading).length));

		function tileMarkup($$renderer, tile) {
			if (tile.href) {
				$$renderer.push(`<!--[0--><a${$.attr_class(`ts-tile ${$.stringify(options.tileClass ?? '')}`)}${$.attr('href', tile.href)}><img${$.attr('src', tile.image)}${$.attr('alt', tile.imageAlt || tile.title || '')}/> `);

				if (caption() === 'overlay' && tile.title) {
					$$renderer.push(`<!--[0--><span>${$.escape(tile.title)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (caption() === 'below' && tile.title) {
					$$renderer.push(`<!--[0--><span>${$.escape(tile.title)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></a>`);
			} else {
				$$renderer.push(`<!--[-1--><figure${$.attr_class(`ts-tile ${$.stringify(options.tileClass ?? '')}`)}><img${$.attr('src', tile.image)}${$.attr('alt', tile.imageAlt || tile.title || '')}/> `);

				if (caption() !== 'none' && tile.title) {
					$$renderer.push(`<!--[0--><figcaption>${$.escape(tile.title)}</figcaption>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></figure>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		if (tiles().length) {
			$$renderer.push(`<!--[0--><section${$.attr_class(`ts-tile-grid ${$.stringify(options.class ?? '')}`)}>`);

			if (hasHeading()) {
				$$renderer.push('<!--[0-->');
				SectionHeading($$renderer, { ctx, options: options.heading });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (hasHeading() || options.gridClass) {
				$$renderer.push(`<!--[0--><div${$.attr_class(`ts-tiles ${$.stringify(options.gridClass ?? '')}`)}><!--[-->`);

				const each_array = $.ensure_array_like(tiles());

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let tile = each_array[index];

					tileMarkup($$renderer, tile);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push(`<!--[-1--><!--[-->`);

				const each_array_1 = $.ensure_array_like(tiles());

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let tile = each_array_1[index];

					tileMarkup($$renderer, tile);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}