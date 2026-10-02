import 'svelte/internal/disclose-version';
import Marker from './Marker.svelte';
import * as $ from 'svelte/internal/client';

export default function MarkerWrapper($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.marker, () => ({ id: $$props.id }));
			$.append($$anchor, fragment_1);
		};

		var consequent_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => typeof $$props.marker === 'string' ? $$props.marker : undefined);

				Marker($$anchor, $.spread_props(
					{
						get id() {
							return $$props.id;
						},

						get type() {
							return $.get($0);
						}
					},
					() => typeof $$props.marker === 'object' ? $$props.marker : null
				));
			}
		};

		$.if(node, ($$render) => {
			if (typeof $$props.marker === 'function') $$render(consequent); else if ($$props.marker) $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
}