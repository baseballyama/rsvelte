import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';

export default function Component_card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			meta,
			ref = void 0,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const layoutClasses = $.derived(() => {
			switch (meta?.layout) {
				case 'full':
					return 'col-span-12';

				case 'wide':
					return 'col-span-12 sm:col-span-6 lg:col-span-6';

				default:
					return 'col-span-12 sm:col-span-6 lg:col-span-4';
			}
		});

		const styleClasses = $.derived(() => {
			switch (meta?.style) {
				case 'centered':
					return 'flex items-center justify-center';

				case 'text-center':
					return 'text-center';

				default:
					return '';
			}
		});

		const overflowClasses = $.derived(() => {
			return meta?.overflow ? 'overflow-auto' : '';
		});

		$$renderer.push(`<div${$.attributes(
			{
				class: $.clsx(cn('group/item relative border', layoutClasses(), styleClasses(), overflowClasses(), className)),
				...rest
			},
			'svelte-e8uynz'
		)}>`);

		children($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}