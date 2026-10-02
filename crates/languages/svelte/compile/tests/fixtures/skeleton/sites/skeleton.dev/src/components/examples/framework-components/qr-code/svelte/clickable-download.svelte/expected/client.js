import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { QrCode } from '@skeletonlabs/skeleton-svelte';

export default function Clickable_download($$anchor) {
	QrCode($$anchor, {
		value: 'https://skeleton.dev',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => QrCode.DownloadTrigger, ($$anchor, QrCode_DownloadTrigger) => {
				QrCode_DownloadTrigger($$anchor, {
					fileName: 'skeleton-dev',
					mimeType: 'image/png',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => QrCode.Frame, ($$anchor, QrCode_Frame) => {
							QrCode_Frame($$anchor, {
								class: 'size-full max-size-36',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => QrCode.Pattern, ($$anchor, QrCode_Pattern) => {
										QrCode_Pattern($$anchor, {});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}