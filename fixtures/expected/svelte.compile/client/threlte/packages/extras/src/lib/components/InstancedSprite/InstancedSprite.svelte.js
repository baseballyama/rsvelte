import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InstancedSpriteMesh } from '@threejs-kit/instanced-sprite-mesh';
import { T, useTask, useThrelte } from '@threlte/core';
import { DoubleSide, Matrix4, MeshBasicMaterial } from 'three';
import { setContext } from 'svelte';
import { writable } from 'svelte/store';
import SpriteInstance from './SpriteInstance.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'autoUpdate',
	'baseMaterial',
	'fps',
	'billboarding',
	'playmode',
	'count',
	'alphaTest',
	'transparent',
	'hueShift',
	'randomPlaybackOffset',
	'spritesheet',
	'ref',
	'children'
]);

export default function InstancedSprite($$anchor, $$props) {
	$.push($$props, true);

	let autoUpdate = $.prop($$props, 'autoUpdate', 3, true),
		baseMaterial = $.prop($$props, 'baseMaterial', 3, MeshBasicMaterial),
		fps = $.prop($$props, 'fps', 3, 15),
		playmode = $.prop($$props, 'playmode', 3, 'FORWARD'),
		count = $.prop($$props, 'count', 3, 1000),
		alphaTest = $.prop($$props, 'alphaTest', 3, 0.1),
		transparent = $.prop($$props, 'transparent', 3, true),
		randomPlaybackOffset = $.prop($$props, 'randomPlaybackOffset', 3, false),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const spriteBaseMaterial = new (baseMaterial())({
		transparent: transparent(),
		alphaTest: alphaTest(),
		// needs to be double side for shading
		side: DoubleSide
	});

	const { renderer } = useThrelte();
	const mesh = new InstancedSpriteMesh(spriteBaseMaterial, count(), renderer);
	const animationMap = writable(new Map());

	$.user_pre_effect(() => {
		if ($$props.spritesheet) {
			mesh.spritesheet = $$props.spritesheet.spritesheet;
			animationMap.set(mesh.animationMap);
			mesh.material.map = $$props.spritesheet.texture;
			mesh.material.needsUpdate = true;
		}
	});

	$.user_pre_effect(() => {
		mesh.material.alphaTest = alphaTest();
	});

	$.user_pre_effect(() => {
		mesh.material.transparent = transparent();
	});

	$.user_pre_effect(() => {
		mesh.fps = fps();
	});

	$.user_pre_effect(() => mesh.hueShift.setGlobal($$props.hueShift));

	// BILLBOARDING
	$.user_pre_effect(() => {
		if ($$props.billboarding === undefined) {
			mesh.billboarding.unsetAll();

			return;
		} else {
			mesh.billboarding.setAll($$props.billboarding);
		}
	});

	// PLAYMODE
	$.user_pre_effect(() => {
		if (playmode() === undefined) {
			mesh.playmode.setAll('PAUSE');

			return;
		} else {
			mesh.playmode.setAll(playmode());
		}
	});

	// RANDOM PLAYBACK OFFSET
	let previousRndOffset = $.state(false);

	$.user_pre_effect(() => {
		// going from no offset to random
		if ($.get(previousRndOffset) === false && randomPlaybackOffset()) {
			mesh.offset.randomizeAll(randomPlaybackOffset() === true ? 100 : randomPlaybackOffset());
		}

		// going from random offset to none
		if ($.get(previousRndOffset) === true && !randomPlaybackOffset()) {
			for (let i = 0; i < count(); i++) {
				mesh.offset.setAt(i, 0);
			}
		}

		$.set(previousRndOffset, randomPlaybackOffset() ? true : false, true);
	});

	// MATRIX UPDATE - POSITION AND SCALE
	let instanceMatrixNeedsUpdate = false;

	const tempMatrix = new Matrix4();

	const updatePosition = (id, position, scale = [1, 1]) => {
		// Since this uses matrix updates, position and scale have to be updated at the same.
		tempMatrix.makeScale(scale[0], scale[1], 1);

		tempMatrix.setPosition(...position);
		mesh.setMatrixAt(id, tempMatrix);
		instanceMatrixNeedsUpdate = true;
	};

	// Context for user facing components and hooks
	setContext('instanced-sprite-ctx', { sprite: mesh, count: count(), animationMap, updatePosition });

	useTask(() => {
		if (autoUpdate()) {
			mesh.update();
		}

		if (instanceMatrixNeedsUpdate) {
			mesh.instanceMatrix.needsUpdate = true;
			instanceMatrixNeedsUpdate = false;
		}
	});

	mesh.update();

	T($$anchor, $.spread_props(
		{
			get is() {
				return mesh;
			},
			frustumCulled: false
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

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ Instance: SpriteInstance }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}