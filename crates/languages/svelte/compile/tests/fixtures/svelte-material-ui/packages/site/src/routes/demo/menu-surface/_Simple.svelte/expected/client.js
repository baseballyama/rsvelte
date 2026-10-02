import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MenuSurface from '@smui/menu-surface';

var root = $.from_html(`<p style="margin: 1em;">This is a menu surface. It's similar to a menu. It is more versatile, but
    requires more configuration. It can contain more than just a list, like rich
    popover content, forms, images, etc.</p>`);

export default function _Simple($$anchor) {
	MenuSurface($$anchor, {
		static: true,
		style: 'max-width: 350px;',
		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});
}