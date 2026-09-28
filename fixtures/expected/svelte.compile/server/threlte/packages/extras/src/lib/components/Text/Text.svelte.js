import * as $ from 'svelte/internal/server';
import { observe, T, useThrelte } from '@threlte/core';
import { tick } from 'svelte';
import { preloadFont, Text as TroikaText } from 'troika-three-text';
import { useSuspense } from '../../suspense/useSuspense.js';

export default function Text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			font = null,
			characters = null,
			sdfGlyphSize = null,
			ref = void 0,
			onsync,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const text = new TroikaText();
		const { invalidate } = useThrelte();

		const onUpdate = async () => {
			await tick();

			text.sync(() => {
				invalidate();
				onsync?.();
			});
		};

		const propsToListenTo = [
			'text',
			'anchorX',
			'anchorY',
			'curveRadius',
			'direction',
			'font',
			'fontSize',
			'letterSpacing',
			'lineHeight',
			'maxWidth',
			'overflowWrap',
			'textAlign',
			'textIndent',
			'whiteSpace',
			'material',
			'color',
			'depthOffset',
			'clipRect',
			'glyphGeometryDetail',
			'sdfGlyphSize',
			'outlineWidth',
			'outlineColor',
			'outlineOpacity',
			'outlineBlur',
			'outlineOffsetX',
			'outlineOffsetY',
			'strokeWidth',
			'strokeColor',
			'strokeOpacity',
			'fillOpacity',
			'characters',
			'colorRanges'
		];

		observe(() => propsToListenTo.map((key) => props[key]), () => {
			onUpdate();
		});

		const suspend = useSuspense();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: text },
				props,
				{
					font,
					characters,
					sdfGlyphSize,
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: text });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}