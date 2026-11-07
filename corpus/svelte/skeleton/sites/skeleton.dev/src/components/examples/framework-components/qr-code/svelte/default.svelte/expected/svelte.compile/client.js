import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import favicon from '@/assets/favicon.png';
import { QrCode } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<img alt="Skeleton Logo" class="size-12"/>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

	QrCode($$anchor, {
		value: 'https://skeleton.dev',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => QrCode.Frame, ($$anchor, QrCode_Frame) => {
				QrCode_Frame($$anchor, {
					class: 'size-full max-size-36',
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
					class: 'bg-white rounded-full p-1',
					children: ($$anchor, $$slotProps) => {
						var img = root();

						$.template_effect(() => $.set_attribute(img, 'src', favicon.src));
						$.append($$anchor, img);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => QrCode.DownloadTrigger, ($$anchor, QrCode_DownloadTrigger) => {
				QrCode_DownloadTrigger($$anchor, {
					fileName: 'skeleton-dev',
					mimeType: 'image/png',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Download');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}