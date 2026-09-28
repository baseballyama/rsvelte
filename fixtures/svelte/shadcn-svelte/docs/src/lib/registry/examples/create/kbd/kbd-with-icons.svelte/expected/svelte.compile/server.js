import * as $ from 'svelte/internal/server';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Kbd_with_icons($$renderer) {
	Example($$renderer, {
		title: 'With Icons',
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
										lucide: 'CircleDashedIcon',
										tabler: 'IconCircleDashed',
										hugeicons: 'DashedLineCircleIcon',
										phosphor: 'CircleDashedIcon',
										remixicon: 'RiLoaderLine'
									});
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
										lucide: 'ArrowLeftIcon',
										tabler: 'IconArrowLeft',
										hugeicons: 'ArrowLeft01Icon',
										phosphor: 'ArrowLeftIcon',
										remixicon: 'RiArrowLeftLine'
									});
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
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine'
									});
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