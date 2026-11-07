import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="py-4"><iframe class="h-[calc(100vh-200px)] w-full border-none" title="World news map" loading="lazy"></iframe></div>`);

export default function MapView($$anchor, $$props) {
	// Props
	// Generate timestamp for iframe URL to prevent caching
	const timestamp = Date.now();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var iframe = $.only_child(div);

			$.template_effect(() => $.set_attribute(iframe, 'src', `/kite_map.html?timestamp=${timestamp}`));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.visible) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}