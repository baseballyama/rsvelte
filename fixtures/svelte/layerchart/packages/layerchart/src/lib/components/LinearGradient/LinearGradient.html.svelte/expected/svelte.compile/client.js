import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createId } from '$lib/utils/createId.js';

export default function LinearGradient_html($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('linearGradient-', uid)),
		stops = $.prop($$props, 'stops', 19, () => ['var(--tw-gradient-from)', 'var(--tw-gradient-to)']),
		vertical = $.prop($$props, 'vertical', 3, false);

	function createCSSGradient() {
		if (!stops()?.length) return '';

		let direction;

		if ($$props.rotate !== undefined) {
			// Convert SVG rotation to CSS linear-gradient angle
			// SVG: rotate(0) on horizontal gradient = left-to-right = CSS 90deg
			// SVG: rotate(0) on vertical gradient = top-to-bottom = CSS 180deg
			const baseAngle = vertical() ? 180 : 90;

			const cssAngle = baseAngle + $$props.rotate;

			direction = `${cssAngle}deg`;
		} else {
			direction = vertical() ? 'to bottom' : 'to right';
		}

		const cssStops = stops().map((stop, i) => {
			if (Array.isArray(stop)) {
				return `${stop[1]} ${stop[0]}`;
			} else {
				return `${stop} ${i * (100 / (stops().length - 1))}%`;
			}
		}).join(', ');

		return `linear-gradient(${direction}, ${cssStops})`;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({ id: id(), gradient: createCSSGradient() }));

		$.snippet(node, () => $$props.children ?? $.noop, () => $.get($0));
	}

	$.append($$anchor, fragment);
	$.pop();
}