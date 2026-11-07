import * as $ from 'svelte/internal/server';

export default function EdgeOption($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// A fixed radius used to demonstrate corner-shape options, independent of the actual radius setting.
		const DEMO_CORNER_RADIUS = '1rem';

		let { mode = 'radius', value, active, onselect } = $$props;

		function handleOnClick() {
			onselect(value);
		}

		// Reactive
		let rxActive = $.derived(() => value === active
			? `preset-tonal-primary border-surface-950-50`
			: `border-surface-300-700 hover:border-surface-500`);

		let rxStyles = $.derived(() => mode === 'thickness'
			? `border-top-width: ${value}; border-left-width: ${value}`
			: mode === 'corner'
				? `border-top-left-radius: ${DEMO_CORNER_RADIUS}; corner-shape: ${value}`
				: `border-top-left-radius: ${value}`);

		$$renderer.push(`<div class="space-y-1"><button${$.attr('aria-label', `edge-option-${$.stringify(value)}`)} type="button"${$.attr_class(`border-1! ${rxActive()} aspect-4/3 w-full flex justify-end items-end rounded-sm overflow-hidden`)}><div class="aspect-4/3 w-[70%] bg-primary-500/30 border-t-4 border-l-4 border-primary-500"${$.attr_style(rxStyles())}></div></button> <div class="text-[10px] text-center">${$.escape(value.replace('0.', '.'))}</div></div>`);
	});
}