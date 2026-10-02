import * as $ from 'svelte/internal/server';
import { QrCode } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	QrCode($$renderer, {
		value: 'https://github.com/skeletonlabs/skeleton',
		children: ($$renderer) => {
			if (QrCode.Frame) {
				$$renderer.push('<!--[-->');

				QrCode.Frame($$renderer, {
					children: ($$renderer) => {
						if (QrCode.Pattern) {
							$$renderer.push('<!--[-->');
							QrCode.Pattern($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (QrCode.Overlay) {
				$$renderer.push('<!--[-->');

				QrCode.Overlay($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Overlay`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (QrCode.DownloadTrigger) {
				$$renderer.push('<!--[-->');

				QrCode.DownloadTrigger($$renderer, {
					mimeType: 'image/png',
					fileName: 'skeleton-qr-code',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Download`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}