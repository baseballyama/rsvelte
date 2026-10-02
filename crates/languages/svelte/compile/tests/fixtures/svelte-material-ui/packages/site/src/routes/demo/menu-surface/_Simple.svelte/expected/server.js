import * as $ from 'svelte/internal/server';
import MenuSurface from '@smui/menu-surface';

export default function _Simple($$renderer) {
	MenuSurface($$renderer, {
		static: true,
		style: 'max-width: 350px;',
		children: ($$renderer) => {
			$$renderer.push(`<p style="margin: 1em;">This is a menu surface. It's similar to a menu. It is more versatile, but
    requires more configuration. It can contain more than just a list, like rich
    popover content, forms, images, etc.</p>`);
		},
		$$slots: { default: true }
	});
}