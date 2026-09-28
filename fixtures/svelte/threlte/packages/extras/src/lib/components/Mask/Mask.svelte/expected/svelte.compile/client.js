import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { ReplaceStencilOp, AlwaysStencilFunc, Mesh } from 'three';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'colorWrite',
	'depthWrite',
	'ref',
	'children'
]);

export default function Mask($$anchor, $$props) {
	$.push($$props, true);

	/*
	  A port of drei's Mask component:
			https://github.com/pmndrs/drei/blob/c147c2b1064bc4b457150f995bf714c2e43cf56f/src/core/Mask.tsx#L38
			*/
	let id = $.prop($$props, 'id', 3, 1),
		colorWrite = $.prop($$props, 'colorWrite', 3, false),
		depthWrite = $.prop($$props, 'depthWrite', 3, false),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const mesh = new Mesh();

	$.user_effect(() => {
		const { material } = mesh;

		if (Array.isArray(material)) return;

		material.colorWrite = colorWrite();
		material.depthWrite = depthWrite();
		material.stencilWrite = true;
		material.stencilRef = id();
		material.stencilFunc = AlwaysStencilFunc;
		material.stencilFail = ReplaceStencilOp;
		material.stencilZFail = ReplaceStencilOp;
		material.stencilZPass = ReplaceStencilOp;
	});

	{
		let $0 = $.derived(() => -id());

		T($$anchor, $.spread_props(
			{
				get is() {
					return mesh;
				},

				get renderOrder() {
					return $.get($0);
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

					$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: mesh }));
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}