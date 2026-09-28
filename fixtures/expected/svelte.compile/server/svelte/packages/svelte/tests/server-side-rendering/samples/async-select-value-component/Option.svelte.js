import * as $ from 'svelte/internal/server';

export default function Option($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		$$renderer.option(
			{ ...props },
			($$renderer) => {
				props.children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			void 0,
			void 0,
			void 0,
			void 0,
			true
		);
	});
}