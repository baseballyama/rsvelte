import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isVisible } from '$lib/utils/geo.js';
import { getGeoContext } from '$lib/contexts/geo.js';

export default function GeoVisible($$anchor, $$props) {
	$.push($$props, true);

	const geo = getGeoContext();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		var d = $.derived(() => geo.projection && isVisible(geo.projection)([$$props.long, $$props.lat]));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}