import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './Inner.svelte';

export default function Nested($$anchor, $$props) {
	Inner($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const key = $.derived(() => $$slotProps.key);
				const set = $.derived(() => $$slotProps.set);
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.slot(
					node,
					$$props,
					'default',
					{
						get key() {
							return $.get(key);
						},
						set: (value) => $.get(set)($.get(key), value)
					},
					null
				);

				$.append($$anchor, fragment_1);
			}
		}
	});
}