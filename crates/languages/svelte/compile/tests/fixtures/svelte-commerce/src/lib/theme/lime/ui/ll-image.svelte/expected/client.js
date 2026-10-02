import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import EmptyImage from '$lib/core/components/image/empty-image.svelte';

var root = $.from_html(`<div class="ll-image svelte-2cj1ms"><!></div>`);

export default function Ll_image($$anchor, $$props) {
	/**
	 * Lime image frame — square, no-radius, blush (#f5f5f5) backdrop,
	 * matching the source product/category imagery. Falls back to the shared
	 * empty-image placeholder when no source is provided.
	 */
	let alt = $.prop($$props, 'alt', 3, ''),
		ratio = $.prop($$props, 'ratio', 3, '1 / 1'),
		fit = $.prop($$props, 'fit', 3, 'cover');

	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			LazyImg($$anchor, {
				get src() {
					return $$props.src;
				},

				get alt() {
					return alt();
				},

				get class() {
					return `ll-image-img ll-image-img--${fit() ?? ''}`;
				}
			});
		};

		var alternate = ($$anchor) => {
			EmptyImage($$anchor, { class: 'll-image-empty' });
		};

		$.if(node, ($$render) => {
			if ($$props.src) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_style(div, `aspect-ratio: ${ratio() ?? ''};`));
	$.append($$anchor, div);
}