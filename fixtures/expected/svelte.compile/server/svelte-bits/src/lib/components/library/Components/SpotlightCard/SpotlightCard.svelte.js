import * as $ from 'svelte/internal/server';

export default function SpotlightCard($$renderer, $$props) {
	let {
		class: className = '',
		spotlightColor = 'rgba(255, 255, 255, 0.25)',
		children
	} = $$props;

	let divRef;
	let isFocused = false;
	let posX = 0;
	let posY = 0;
	let opacity = 0;

	function handleMouseMove(e) {
		if (!divRef || isFocused) return;

		const rect = divRef.getBoundingClientRect();

		posX = e.clientX - rect.left;
		posY = e.clientY - rect.top;
	}

	function handleFocus() {
		isFocused = true;
		opacity = 0.6;
	}

	function handleBlur() {
		isFocused = false;
		opacity = 0;
	}

	function handleMouseEnter() {
		opacity = 0.6;
	}

	function handleMouseLeave() {
		opacity = 0;
	}

	$$renderer.push(`<div role="presentation"${$.attr_class(`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8 ${className}`)}><div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"${$.attr_style(`opacity:${$.stringify(opacity)};background:radial-gradient(circle at ${$.stringify(posX)}px ${$.stringify(posY)}px, ${$.stringify(spotlightColor)}, transparent 80%);`)}></div> `);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}