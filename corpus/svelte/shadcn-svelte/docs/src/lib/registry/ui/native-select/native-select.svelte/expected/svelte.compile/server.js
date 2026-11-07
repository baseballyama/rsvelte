import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

export default function Native_select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			class: className,
			size = "default",
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn("cn-native-select-wrapper group/native-select relative w-fit has-[select:disabled]:opacity-50", className)))} data-slot="native-select-wrapper"${$.attr('data-size', size)}>`);

		$$renderer.select(
			{
				value,
				this: ref,
				'data-slot': 'native-select',
				'data-size': size,
				class: 'cn-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed',
				...restProps
			},
			($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			void 0,
			void 0,
			void 0,
			void 0,
			true
		);

		$$renderer.push(` `);

		IconPlaceholder($$renderer, {
			lucide: 'ChevronDownIcon',
			tabler: 'IconSelector',
			hugeicons: 'UnfoldMoreIcon',
			phosphor: 'CaretDownIcon',
			remixicon: 'RiArrowDownSLine',
			class: 'cn-native-select-icon pointer-events-none absolute select-none',
			'aria-hidden': true,
			'data-slot': 'native-select-icon'
		});

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref, value });
	});
}