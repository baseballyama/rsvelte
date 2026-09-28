import * as $ from 'svelte/internal/server';
import { QrCode } from '@skeletonlabs/skeleton-svelte';

export default function Frame_colors($$renderer) {
	QrCode($$renderer, {
		value: 'https://skeleton.dev',
		children: ($$renderer) => {
			if (QrCode.Frame) {
				$$renderer.push('<!--[-->');

				QrCode.Frame($$renderer, {
					class: 'size-full max-size-36 bg-brand-dark',
					children: ($$renderer) => {
						if (QrCode.Pattern) {
							$$renderer.push('<!--[-->');
							QrCode.Pattern($$renderer, { class: 'fill-brand-contrast-dark' });
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
				QrCode.Overlay($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}