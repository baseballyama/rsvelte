import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FlowbiteSvelteLayout from "../layouts/FlowbiteSvelteLayout.svelte";
import ComponentsLayout from "../layouts/ComponentsLayout.svelte";

export default function _layout($$anchor, $$props) {
	FlowbiteSvelteLayout($$anchor, {
		children: ($$anchor, $$slotProps) => {
			ComponentsLayout($$anchor, {
				get data() {
					return $$props.data;
				},
				submenu: 'illustrations',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.snippet(node, () => $$props.children);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}