import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useProductState } from '$lib/core/composables/index.js';
import { Badge } from '$lib/components/ui/badge';
import { page } from '$app/state';

var root = $.from_html(`<div class=" flex flex-wrap gap-2 edp-tags"></div>`);

export default function Product_tags($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();
	const data = $.derived(() => page.data);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.each(div, 21, () => ($.get(data)?.product.productTags || '').split(',') || [], $.index, ($$anchor, t) => {
				Badge($$anchor, {
					variant: 'outline',
					class: 'edp-tag',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(t)));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(data)?.product?.productTags?.length > 0) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}