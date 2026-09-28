import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { useProductState } from '$lib/core/composables/index.js';

var root = $.from_html(`<div class="card edp-meta-item"><div class="card-header"><h3 class="card-title edp-meta-key"> </h3></div> <div class="card-content edp-meta-val"><p> </p></div></div>`);
var root_1 = $.from_html(`<div class="mt-4 edp-meta"><div class="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2"></div></div>`);

export default function Product_meta_data_section($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();
	const data = $.derived(() => page.data);
	const metadataEntries = $.derived(() => Object.entries($.get(data)?.product?.metadata || {}).filter(([key]) => !(/^(product )?specifications?$/i).test(key.trim())));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);

			$.each(div_1, 21, () => $.get(metadataEntries), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let key = () => $.get($$array)[0];
				let value = () => $.get($$array)[1];
				var div_2 = root();
				var div_3 = $.child(div_2);
				var h3 = $.child(div_3);
				var text = $.only_child(h3, true);

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var p = $.child(div_4);
				var text_1 = $.only_child(p, true);

				$.reset(div_4);
				$.reset(div_2);

				$.template_effect(() => {
					$.set_text(text, key());
					$.set_text(text_1, value());
				});

				$.append($$anchor, div_2);
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(metadataEntries).length) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}