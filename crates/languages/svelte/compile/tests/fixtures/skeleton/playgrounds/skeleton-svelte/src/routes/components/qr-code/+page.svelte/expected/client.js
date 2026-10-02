import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { QrCode } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor) {
	QrCode($$anchor, {
		value: 'https://github.com/skeletonlabs/skeleton',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => QrCode.Frame, ($$anchor, QrCode_Frame) => {
				QrCode_Frame($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => QrCode.Pattern, ($$anchor, QrCode_Pattern) => {
							QrCode_Pattern($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => QrCode.Overlay, ($$anchor, QrCode_Overlay) => {
				QrCode_Overlay($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Overlay');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => QrCode.DownloadTrigger, ($$anchor, QrCode_DownloadTrigger) => {
				QrCode_DownloadTrigger($$anchor, {
					mimeType: 'image/png',
					fileName: 'skeleton-qr-code',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Download');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}