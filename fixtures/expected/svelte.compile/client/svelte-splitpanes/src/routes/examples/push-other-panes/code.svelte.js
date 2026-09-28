import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';

var root = $.from_html(`<span></span> <p>Double click splitter -></p>`, 1);

export default function Code($$anchor) {
	Splitpanes($$anchor, {
		style: 'height: 400px',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => ({ length: 8 }), $.index, ($$anchor, _, i) => {
				Pane($$anchor, {
					minSize: 5,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var span = $.first_child(fragment_3);

						span.textContent = i + 1;
						$.next(2);
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}