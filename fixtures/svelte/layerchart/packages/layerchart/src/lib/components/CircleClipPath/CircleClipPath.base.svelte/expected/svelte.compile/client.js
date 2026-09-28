import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createId } from '$lib/utils/createId.js';

export default function CircleClipPath_base($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('clipPath-', uid)),
		cx = $.prop($$props, 'cx', 3, 0),
		cy = $.prop($$props, 'cy', 3, 0),
		disabled = $.prop($$props, 'disabled', 3, false),
		invert = $.prop($$props, 'invert', 3, false);

	const path = $.derived(() => `M${cx() - $$props.r},${cy()} a${$$props.r},${$$props.r} 0 1,0 ${2 * $$props.r},0 a${$$props.r},${$$props.r} 0 1,0 ${-2 * $$props.r},0 Z`);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $$props.ClipPath, ($$anchor, ClipPath_1) => {
		ClipPath_1($$anchor, {
			get id() {
				return id();
			},

			get disabled() {
				return disabled();
			},

			get invert() {
				return invert();
			},

			get children() {
				return $$props.children;
			},

			get path() {
				return $.get(path);
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}