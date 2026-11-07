import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Project, Sheet, Studio } from '../index.js';

export default function Theatre($$anchor, $$props) {
	let studio = $.prop($$props, 'studio', 19, () => ({})),
		config = $.prop($$props, 'config', 3, undefined);

	Studio($$anchor, $.spread_props(studio, {
		children: ($$anchor, $$slotProps) => {
			Project($$anchor, {
				get config() {
					return config();
				},

				children: ($$anchor, $$slotProps) => {
					Sheet($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node = $.first_child(fragment_3);

							$.snippet(node, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	}));
}