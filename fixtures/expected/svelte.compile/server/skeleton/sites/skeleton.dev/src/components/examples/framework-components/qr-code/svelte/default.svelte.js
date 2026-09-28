import * as $ from 'svelte/internal/server';
import favicon from '@/assets/favicon.png';
import { QrCode } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		QrCode($$renderer, {
			value: 'https://skeleton.dev',
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

				$$renderer.push(` `);

				if (QrCode.Overlay) {
					$$renderer.push('<!--[-->');

					QrCode.Overlay($$renderer, {
						class: 'bg-white rounded-full p-1',
						children: ($$renderer) => {
							$$renderer.push(`<img${$.attr('src', favicon.src)} alt="Skeleton Logo" class="size-12"/>`);
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
						fileName: 'skeleton-dev',
						mimeType: 'image/png',
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
	});
}