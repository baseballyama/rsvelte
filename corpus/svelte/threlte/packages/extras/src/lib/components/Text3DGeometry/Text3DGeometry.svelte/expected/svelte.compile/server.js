import * as $ from 'svelte/internal/server';
import { T, asyncWritable, useLoader } from '@threlte/core';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useSuspense } from '../../suspense/useSuspense.js';

export default function Text3DGeometry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			text,
			font = 'https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json',
			size,
			depth,
			curveSegments,
			bevelEnabled,
			bevelThickness,
			bevelSize,
			bevelOffset,
			bevelSegments,
			smooth,
			extrudePath,
			steps,
			UVGenerator,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const suspend = useSuspense();
		const loader = useLoader(FontLoader);

		let loadedFont = $.derived(() => suspend(typeof font === 'string'
			? loader.load(font)
			: asyncWritable(new Promise((resolve) => resolve(font)))));

		let baseGeometry = $.derived(() => {
			if (!$.store_get($$store_subs ??= {}, '$loadedFont', loadedFont())) return;

			return new TextGeometry(text, {
				font: $.store_get($$store_subs ??= {}, '$loadedFont', loadedFont()),
				size,
				depth,
				curveSegments,
				bevelEnabled,
				bevelThickness,
				bevelSize,
				bevelOffset,
				bevelSegments,
				extrudePath,
				steps,
				UVGenerator
			});
		});

		let creasedGeometry = $.derived(() => {
			if (!baseGeometry()) return;
			if (smooth === 0) return baseGeometry();

			return toCreasedNormals(baseGeometry(), smooth);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (creasedGeometry()) {
				$$renderer.push('<!--[0-->');

				T($$renderer, $.spread_props([
					{ is: creasedGeometry() },
					props,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							children?.($$renderer, { ref: creasedGeometry() });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref });
	});
}