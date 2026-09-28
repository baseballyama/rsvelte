import * as $ from 'svelte/internal/server';
import { QrCode } from '@skeletonlabs/skeleton-svelte';

export default function Clickable_download($$renderer) {
	QrCode($$renderer, {
		value: 'https://skeleton.dev',
		children: ($$renderer) => {
			if (QrCode.DownloadTrigger) {
				$$renderer.push('<!--[-->');

				QrCode.DownloadTrigger($$renderer, {
					fileName: 'skeleton-dev',
					mimeType: 'image/png',
					children: ($$renderer) => {
						if (QrCode.Frame) {
							$$renderer.push('<!--[-->');

							QrCode.Frame($$renderer, {
								class: 'size-full max-size-36',
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