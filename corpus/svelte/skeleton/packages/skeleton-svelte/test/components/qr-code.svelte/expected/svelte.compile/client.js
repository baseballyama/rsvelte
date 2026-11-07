import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { QrCode } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Qr_code($$anchor) {
	QrCode($$anchor, {
		value: '',
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => QrCode.Frame, ($$anchor, QrCode_Frame) => {
				QrCode_Frame($$anchor, {
					'data-testid': 'frame',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => QrCode.Pattern, ($$anchor, QrCode_Pattern) => {
							QrCode_Pattern($$anchor, { 'data-testid': 'pattern' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => QrCode.Overlay, ($$anchor, QrCode_Overlay) => {
				QrCode_Overlay($$anchor, { 'data-testid': 'overlay' });
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => QrCode.DownloadTrigger, ($$anchor, QrCode_DownloadTrigger) => {
				QrCode_DownloadTrigger($$anchor, {
					'data-testid': 'download-trigger',
					mimeType: 'image/png',
					fileName: ''
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}