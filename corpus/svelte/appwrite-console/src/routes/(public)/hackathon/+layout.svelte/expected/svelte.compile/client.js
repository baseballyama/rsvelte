import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Shell } from '$lib/layout';
import Footer from '$lib/layout/footer.svelte';

export default function _layout($$anchor, $$props) {
	Shell($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.slot(node, $$props, 'default', {}, null);
			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				Footer($$anchor, { slot: 'footer' });
			}
		}
	});
}