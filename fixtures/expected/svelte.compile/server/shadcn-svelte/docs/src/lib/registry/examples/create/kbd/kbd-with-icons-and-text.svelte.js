import * as $ from 'svelte/internal/server';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Kbd_with_icons_and_text($$renderer) {
	Example($$renderer, {
		title: 'With Icons and Text',
		children: ($$renderer) => {
			if (Kbd.Group) {
				$$renderer.push('<!--[-->');

				Kbd.Group($$renderer, {
					children: ($$renderer) => {
						if (Kbd.Root) {
							$$renderer.push('<!--[-->');

							Kbd.Root($$renderer, {
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'ArrowLeftIcon',
										tabler: 'IconArrowLeft',
										hugeicons: 'ArrowLeft01Icon',
										phosphor: 'ArrowLeftIcon',
										remixicon: 'RiArrowLeftLine'
									});

									$$renderer.push(`<!----> Left`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Kbd.Root) {
							$$renderer.push('<!--[-->');

							Kbd.Root($$renderer, {
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'CircleDashedIcon',
										tabler: 'IconCircleDashed',
										hugeicons: 'DashedLineCircleIcon',
										phosphor: 'CircleDashedIcon',
										remixicon: 'RiLoaderLine'
									});

									$$renderer.push(`<!----> Voice Enabled`);
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