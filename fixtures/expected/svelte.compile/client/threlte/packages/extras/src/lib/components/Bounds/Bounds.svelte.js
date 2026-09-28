import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group } from 'three';
import { T, useThrelte } from '@threlte/core';
import { useControlsContext } from '../controls/useControlsContext.js';
import { provideBounds } from './useBounds.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'margin',
	'animate',
	'enabled',
	'onFit',
	'ref',
	'children'
]);

export default function Bounds($$anchor, $$props) {
	$.push($$props, true);

	const $cameraControls = () => $.store_get(cameraControls, '$cameraControls', $$stores);
	const $orbitControls = () => $.store_get(orbitControls, '$orbitControls', $$stores);
	const $trackballControls = () => $.store_get(trackballControls, '$trackballControls', $$stores);
	const $size = () => $.store_get(size, '$size', $$stores);
	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/* eslint-disable @typescript-eslint/no-unused-expressions */
	let margin = $.prop($$props, 'margin', 3, 1),
		animate = $.prop($$props, 'animate', 3, true),
		enabled = $.prop($$props, 'enabled', 3, true),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const { camera, size } = useThrelte();
	const { orbitControls, trackballControls, cameraControls } = useControlsContext();
	const group = new Group();
	const bounds = provideBounds(() => group, () => margin(), () => animate(), () => $$props.onFit);
	const controls = $.derived(() => $cameraControls() ?? $orbitControls() ?? $trackballControls());

	const fit = () => {
		bounds.fit();
	};

	const reset = () => {
		bounds.reset();
	};

	$.user_effect(() => {
		$size();
		enabled();
		margin();
		$camera();
		$.get(controls);
		animate();

		if (enabled()) {
			fit();
		}
	});

	var $$exports = { bounds, fit, reset };

	T($$anchor, $.spread_props(
		{
			get is() {
				return group;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: group }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}