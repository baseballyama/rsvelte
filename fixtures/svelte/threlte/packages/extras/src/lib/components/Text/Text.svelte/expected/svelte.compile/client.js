import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { observe, T, useThrelte } from '@threlte/core';
import { tick } from 'svelte';
import { preloadFont, Text as TroikaText } from 'troika-three-text';
import { useSuspense } from '../../suspense/useSuspense.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'font',
	'characters',
	'sdfGlyphSize',
	'ref',
	'onsync',
	'children'
]);

export default function Text($$anchor, $$props) {
	$.push($$props, true);

	let font = $.prop($$props, 'font', 3, null),
		characters = $.prop($$props, 'characters', 3, null),
		sdfGlyphSize = $.prop($$props, 'sdfGlyphSize', 3, null),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const text = new TroikaText();
	const { invalidate } = useThrelte();

	const onUpdate = async () => {
		await tick();

		text.sync(() => {
			invalidate();
			$$props.onsync?.();
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

	$.user_pre_effect(() => {
		suspend(new Promise((res) => preloadFont(
			{
				font: font(),
				characters: characters(),
				sdfGlyphSize: sdfGlyphSize()
			},
			res
		)));
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return text;
			}
		},
		() => props,
		{
			get font() {
				return font();
			},

			get characters() {
				return characters();
			},

			get sdfGlyphSize() {
				return sdfGlyphSize();
			},

			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: text }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}