import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	Component($$anchor, {
		propA: true,
		propB,
		propC: 'val1',
		propD: 'val2',
		propE: `a${a ?? ''}b${b ?? ''}`,
		$$events: {
			click: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		}
	});
}