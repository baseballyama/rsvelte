import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_icon_left($$renderer) {
	Example($$renderer, {
		title: 'Icon Left',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				size: 'xs',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'secondary',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'outline',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'ghost',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'destructive',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'xs',
				variant: 'link',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				size: 'sm',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'secondary',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'outline',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'ghost',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'destructive',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'link',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'secondary',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'ghost',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'destructive',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'link',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-wrap items-center gap-2">`);

			Button($$renderer, {
				size: 'lg',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'secondary',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'outline',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'ghost',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'destructive',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'lg',
				variant: 'link',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowLeftCircleIcon',
						hugeicons: 'CircleArrowLeft02Icon',
						tabler: 'IconCircleArrowLeft',
						phosphor: 'ArrowCircleLeftIcon',
						remixicon: 'RiArrowLeftCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}