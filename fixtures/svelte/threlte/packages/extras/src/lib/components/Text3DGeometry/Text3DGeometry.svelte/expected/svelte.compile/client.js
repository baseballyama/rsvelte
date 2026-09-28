import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, asyncWritable, useLoader } from '@threlte/core';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useSuspense } from '../../suspense/useSuspense.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'text',
	'font',
	'size',
	'depth',
	'curveSegments',
	'bevelEnabled',
	'bevelThickness',
	'bevelSize',
	'bevelOffset',
	'bevelSegments',
	'smooth',
	'extrudePath',
	'steps',
	'UVGenerator',
	'ref',
	'children'
]);

export default function Text3DGeometry($$anchor, $$props) {
	$.push($$props, true);

	const $loadedFont = () => $.store_get($.get(loadedFont), '$loadedFont', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let font = $.prop($$props, 'font', 3, 'https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json'),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const suspend = useSuspense();
	const loader = useLoader(FontLoader);

	let loadedFont = $.derived(() => suspend(typeof font() === 'string'
		? loader.load(font())
		: asyncWritable(new Promise((resolve) => resolve(font())))));

	let baseGeometry = $.derived(() => {
		if (!$loadedFont()) return;

		return new TextGeometry($$props.text, {
			font: $loadedFont(),
			size: $$props.size,
			depth: $$props.depth,
			curveSegments: $$props.curveSegments,
			bevelEnabled: $$props.bevelEnabled,
			bevelThickness: $$props.bevelThickness,
			bevelSize: $$props.bevelSize,
			bevelOffset: $$props.bevelOffset,
			bevelSegments: $$props.bevelSegments,
			extrudePath: $$props.extrudePath,
			steps: $$props.steps,
			UVGenerator: $$props.UVGenerator
		});
	});

	let creasedGeometry = $.derived(() => {
		if (!$.get(baseGeometry)) return;
		if ($$props.smooth === 0) return $.get(baseGeometry);

		return toCreasedNormals($.get(baseGeometry), $$props.smooth);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			T($$anchor, $.spread_props(
				{
					get is() {
						return $.get(creasedGeometry);
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
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ ref: $.get(creasedGeometry) }));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}
			));
		};

		$.if(node, ($$render) => {
			if ($.get(creasedGeometry)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}