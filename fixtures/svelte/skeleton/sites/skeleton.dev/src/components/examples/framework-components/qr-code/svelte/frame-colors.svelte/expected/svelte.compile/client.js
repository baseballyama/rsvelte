import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { QrCode } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Frame_colors($$anchor) {
	QrCode($$anchor, {
		value: 'https://skeleton.dev',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => QrCode.Frame, ($$anchor, QrCode_Frame) => {
				QrCode_Frame($$anchor, {
					class: 'size-full max-size-36 bg-brand-dark',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => QrCode.Pattern, ($$anchor, QrCode_Pattern) => {
							QrCode_Pattern($$anchor, { class: 'fill-brand-contrast-dark' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => QrCode.Overlay, ($$anchor, QrCode_Overlay) => {
				QrCode_Overlay($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}