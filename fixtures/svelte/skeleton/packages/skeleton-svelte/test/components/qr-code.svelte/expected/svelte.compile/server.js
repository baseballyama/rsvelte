import * as $ from 'svelte/internal/server';
import { QrCode } from '../../src/index.js';

export default function Qr_code($$renderer) {
	QrCode($$renderer, {
		value: '',
		'data-testid': 'root',
		children: ($$renderer) => {
			if (QrCode.Frame) {
				$$renderer.push('<!--[-->');

				QrCode.Frame($$renderer, {
					'data-testid': 'frame',
					children: ($$renderer) => {
						if (QrCode.Pattern) {
							$$renderer.push('<!--[-->');
							QrCode.Pattern($$renderer, { 'data-testid': 'pattern' });
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
				QrCode.Overlay($$renderer, { 'data-testid': 'overlay' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (QrCode.DownloadTrigger) {
				$$renderer.push('<!--[-->');

				QrCode.DownloadTrigger($$renderer, {
					'data-testid': 'download-trigger',
					mimeType: 'image/png',
					fileName: ''
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