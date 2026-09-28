import * as $ from 'svelte/internal/server';

export default function Magnet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			padding = 100,
			disabled = false,
			magnetStrength = 2,
			activeTransition = 'transform 0.3s ease-out',
			inactiveTransition = 'transform 0.5s ease-in-out',
			wrapperClass = '',
			innerClass = ''
		} = $$props;

		let magnetEl;
		let active = false;
		let pos = { x: 0, y: 0 };

		$$renderer.push(`<div${$.attr_class($.clsx(wrapperClass))} style="position:relative;display:inline-block;"><div${$.attr_class($.clsx(innerClass))}${$.attr_style(`transform:translate3d(${$.stringify(pos.x)}px,${$.stringify(pos.y)}px,0);transition:${$.stringify(active ? activeTransition : inactiveTransition)};will-change:transform;`)}>`);
		children($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}