import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

var root = $.from_html(`<enhanced:img src="/src/images/content-gallery-3.png" alt="Default enhanced example"></enhanced:img>`);

export default function Enhanced($$anchor) {
	Img($$anchor, {
		caption: 'Default enhanced image',
		size: 'md',
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var enhanced_img = root();

			$.append($$anchor, enhanced_img);
		},
		$$slots: { default: true }
	});
}