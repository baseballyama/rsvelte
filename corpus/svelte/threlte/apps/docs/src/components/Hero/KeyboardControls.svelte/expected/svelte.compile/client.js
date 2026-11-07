import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';

export default function KeyboardControls($$anchor, $$props) {
	$.push($$props, true);

	let translationSnap = $.prop($$props, 'translationSnap', 3, 1),
		rotationSnap = $.prop($$props, 'rotationSnap', 19, () => 15 * MathUtils.DEG2RAD),
		scaleSnap = $.prop($$props, 'scaleSnap', 3, 0.1);

	let useSnap = $.state(false);
	let mode = $.state('translate');
	let space = $.state('local');

	const onKeyDown = (e) => {
		// toggle snap on Shift
		if (e.key === 'Shift') {
			$.set(useSnap, true);
		}
	};

	const onKeyUp = (e) => {
		if (e.key === 'Shift') {
			$.set(useSnap, false);
		}
	};

	const onKeyPress = (e) => {
		if (e.key === 't') $.set(mode, 'translate');
		if (e.key === 'r') $.set(mode, 'rotate');
		if (e.key === 's') $.set(mode, 'scale');

		if (e.key === 'g') {
			if ($.get(space) === 'world') {
				$.set(space, 'local');
			} else {
				$.set(space, 'world');
			}
		}
	};

	var fragment = $.comment();

	$.event('keydown', $.window, onKeyDown);
	$.event('keyup', $.window, onKeyUp);
	$.event('keypress', $.window, onKeyPress);

	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({
		transform: {
			translationSnap: $.get(useSnap) ? translationSnap() : undefined,
			rotationSnap: $.get(useSnap) ? rotationSnap() : undefined,
			scaleSnap: $.get(useSnap) ? scaleSnap() : undefined,
			mode: $.get(mode),
			space: $.get(space)
		}
	}));

	$.append($$anchor, fragment);
	$.pop();
}