import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Text } from "carbon-components-svelte";

export default function ComponentTocLabel($$anchor) {
	Text($$anchor, {
		tag: 'h5',
		type: 'label-01',
		color: 'primary',
		class: 'toc-section-label',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Examples');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}