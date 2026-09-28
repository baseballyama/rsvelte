import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Portal from './Portal.svelte';

export default function ToolbarItem($$anchor, $$props) {
	let position = $.prop($$props, 'position', 3, 'left');

	Portal($$anchor, {
		get target() {
			return `.toolbar-items-${position() ?? ''}`;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}