import * as $ from 'svelte/internal/server';

export default function Native_select_option($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.option(
			{ this: ref, 'data-slot': 'native-select-option', ...restProps },
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

		$.bind_props($$props, { ref });
	});
}