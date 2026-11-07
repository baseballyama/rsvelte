import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { getMapContext } from './context.svelte.js';

export default function Control($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			defaultStyling = true,
			position = 'top-right',
			class: classNames = undefined,
			children
		} = $$props;

		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map);

		let el = void 0;

		let control = {
			onAdd() {
				return el;
			},

			onRemove() {
				el?.parentNode?.removeChild(el);
			}
		};

		onDestroy(() => {
			map()?.removeControl(control);
		});

		$$renderer.push(`<div${$.attr_class($.clsx(classNames), void 0, { 'maplibregl-ctrl': defaultStyling })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}