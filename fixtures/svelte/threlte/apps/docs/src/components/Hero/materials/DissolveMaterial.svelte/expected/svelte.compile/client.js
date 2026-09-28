import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Color, MeshStandardMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import { fragmentShader, vertexShader } from './shaders';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'progress',
	'scale',
	'ref',
	'children'
]);

export default function DissolveMaterial($$anchor, $$props) {
	$.push($$props, true);

	const CSM = CustomShaderMaterial;

	const material = new CSM({
		baseMaterial: MeshStandardMaterial,
		vertexShader,
		fragmentShader,
		uniforms: {
			uThickness: { value: 0.1 },
			uColor: { value: new Color('#ffffff') },
			uProgress: { value: 0 },
			uSeed: { value: Math.random() },
			uScale: { value: 1 }
		},
		transparent: true,
		toneMapped: false
	});

	let ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	ref(material);

	$.user_pre_effect(() => {
		if (material.uniforms.uProgress) material.uniforms.uProgress.value = $$props.progress;
	});

	$.user_pre_effect(() => {
		if (material.uniforms.uScale) material.uniforms.uScale.value = $$props.scale;
	});

	useTask((delta) => {
		if (material.uniforms.uSeed) material.uniforms.uSeed.value += delta * 0.001;
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return material;
			}
		},
		() => props,
		{
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: material }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}