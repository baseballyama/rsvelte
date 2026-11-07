import * as $ from 'svelte/internal/server';

export default function ControlButton($$renderer, $$props) {
	/** True if this is an icon button. This will both enable the built-in MapLibre
	 * icon button styling and center the element inside the button.
	 * @default true since most map buttons are icons. */
	let {
		icon = true,
		center = true,
		title = undefined,
		class: classNames = undefined,
		children,
		onclick
	} = $$props;

	$$renderer.push(`<button type="button"${$.attr('title', title)}><div${$.attr_class($.clsx(classNames), 'svelte-1tv6if0', { 'maplibregl-ctrl-icon': icon, 'ctrl-btn-center': center })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></div></button>`);
}