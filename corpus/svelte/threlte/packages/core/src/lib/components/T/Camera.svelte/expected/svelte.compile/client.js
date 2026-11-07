import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useCamera } from './utils/useCamera.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'manual',
	'makeDefault'
]);

export default function Camera($$anchor, $$props) {
	$.push($$props, true);

	let manual = $.prop($$props, 'manual', 3, false),
		makeDefault = $.prop($$props, 'makeDefault', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	useCamera(() => $$props.ref, () => manual(), () => makeDefault(), () => rest);
	$.pop();
}