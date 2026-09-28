import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask, useThrelte } from '@threlte/core';
import { onDestroy } from 'svelte';

import {
	Color,
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshDepthMaterial,
	OrthographicCamera,
	PlaneGeometry,
	ShaderMaterial,
	WebGLRenderTarget
} from 'three';

import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'opacity',
	'width',
	'height',
	'blur',
	'far',
	'smooth',
	'resolution',
	'frames',
	'scale',
	'color',
	'depthWrite',
	'ref',
	'children'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function ContactShadows($$anchor, $$props) {
	$.push($$props, true);

	let opacity = $.prop($$props, 'opacity', 3, 1),
		width = $.prop($$props, 'width', 3, 1),
		height = $.prop($$props, 'height', 3, 1),
		blur = $.prop($$props, 'blur', 3, 1),
		far = $.prop($$props, 'far', 3, 10),
		smooth = $.prop($$props, 'smooth', 3, true),
		resolution = $.prop($$props, 'resolution', 3, 512),
		frames = $.prop($$props, 'frames', 3, Infinity),
		scale = $.prop($$props, 'scale', 3, 10),
		color = $.prop($$props, 'color', 3, '#000000'),
		depthWrite = $.prop($$props, 'depthWrite', 3, false),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const { scene, renderer } = useThrelte();
	const group = new Group();
	const scaledWidth = $.derived(() => width() * (Array.isArray(scale()) ? scale()[0] : scale() || 1));
	const scaledHeight = $.derived(() => height() * (Array.isArray(scale()) ? scale()[1] : scale() || 1));

	const renderTarget = $.derived(() => {
		const rt = new WebGLRenderTarget(resolution(), resolution());

		rt.texture.generateMipmaps = false;
		rt.texture.colorSpace = renderer.outputColorSpace;

		return rt;
	});

	const renderTargetBlur = $.derived(() => {
		const rt = new WebGLRenderTarget(resolution(), resolution());

		rt.texture.generateMipmaps = false;

		return rt;
	});

	const planeGeometry = $.derived(() => new PlaneGeometry($.get(scaledWidth), $.get(scaledHeight)).rotateX(Math.PI / 2));
	const blurPlane = $.derived(() => new Mesh($.get(planeGeometry)));

	const depthMaterial = $.derived(() => {
		const currentColor = color();
		const dm = new MeshDepthMaterial({ depthTest: false, depthWrite: false });

		dm.onBeforeCompile = (shader) => {
			shader.uniforms = {
				...shader.uniforms,
				uColor: { value: new Color(currentColor).convertSRGBToLinear() }
			};

			shader.fragmentShader = `uniform vec3 uColor;\n${shader.fragmentShader}`;
			shader.fragmentShader = shader.fragmentShader.replace('vec4( vec3( 1.0 - fragCoordZ ), opacity );', 'vec4( uColor, ( 1.0 - fragCoordZ ) * 1.0 );');

			// minified replace, https://github.com/yushijinhun/three-minifier also minifies GLSL files
			shader.fragmentShader = shader.fragmentShader.replace('vec4(vec3(1.0-fragCoordZ),opacity);', 'vec4(uColor,(1.0-fragCoordZ)*1.0);');
		};

		return dm;
	});

	const horizontalBlurMaterial = new ShaderMaterial({ ...HorizontalBlurShader, depthTest: false });
	const verticalBlurMaterial = new ShaderMaterial({ ...VerticalBlurShader, depthTest: false });
	const shadowCamera = $.derived(() => new OrthographicCamera(-$.get(scaledWidth) / 2, $.get(scaledWidth) / 2, $.get(scaledHeight) / 2, -$.get(scaledHeight) / 2, 0, far()));

	$.user_pre_effect(() => $.get(shadowCamera).updateProjectionMatrix());

	const shadowMaterial = $.derived(() => new MeshBasicMaterial({
		map: $.get(renderTarget).texture,
		transparent: true,
		opacity: opacity(),
		depthWrite: depthWrite()
	}));

	const blurShadows = (blur) => {
		// separate from store to not call store setter
		$.get(blurPlane).visible = true;

		$.get(blurPlane).material = horizontalBlurMaterial;
		horizontalBlurMaterial.uniforms.tDiffuse.value = $.get(renderTarget).texture;
		horizontalBlurMaterial.uniforms.h.value = blur * 1 / 256;
		renderer.setRenderTarget($.get(renderTargetBlur));
		renderer.render($.get(blurPlane), $.get(shadowCamera));
		$.get(blurPlane).material = verticalBlurMaterial;
		verticalBlurMaterial.uniforms.tDiffuse.value = $.get(renderTargetBlur).texture;
		verticalBlurMaterial.uniforms.v.value = blur * 1 / 256;
		renderer.setRenderTarget($.get(renderTarget));
		renderer.render($.get(blurPlane), $.get(shadowCamera));
		$.get(blurPlane).visible = false;
	};

	const renderShadows = () => {
		// remove the background
		const initialBackground = scene.background;

		scene.background = null;

		// force the depthMaterial to everything
		const initialOverrideMaterial = scene.overrideMaterial;

		scene.overrideMaterial = $.get(depthMaterial);

		// set renderer clear alpha
		const initialClearAlpha = renderer.getClearAlpha();

		renderer.setClearAlpha(0);

		// render to the render target to get the depths
		renderer.setRenderTarget($.get(renderTarget));

		renderer.render(scene, $.get(shadowCamera));

		// and reset the override material
		scene.overrideMaterial = initialOverrideMaterial;

		blurShadows(blur());

		// a second pass to reduce the artifacts
		if (smooth()) blurShadows(blur() * 0.4);

		// reset
		renderer.setRenderTarget(null);

		scene.background = initialBackground;
		renderer.setClearAlpha(initialClearAlpha);
	};

	/**
	 * Renders the shadows.
	 */
	const refresh = () => {
		renderShadows();
	};

	const continuous = $.derived(() => frames() === Number.POSITIVE_INFINITY);

	useTask(renderShadows, { running: () => $.get(continuous) });

	let count = 0;

	useTask(
		() => {
			renderShadows();
			count += 1;
		},
		{ running: () => !$.get(continuous) && count < frames() }
	);

	onDestroy(() => {
		$.get(renderTarget).dispose();
		$.get(renderTargetBlur).dispose();
		$.get(planeGeometry).dispose();
		$.get(depthMaterial).dispose();
		horizontalBlurMaterial.dispose();
		verticalBlurMaterial.dispose();
		$.get(shadowMaterial).dispose();
	});

	var $$exports = { refresh };

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

				$.component(node, () => T.Group, ($$anchor, T_Group) => {
					T_Group($$anchor, {
						'rotation.x': Math.PI / 2,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_1 = $.first_child(fragment_2);

							$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
								T_Mesh($$anchor, {
									'scale.y': -1,
									'rotation.x': -Math.PI / 2,
									get material() {
										return $.get(shadowMaterial);
									},

									get geometry() {
										return $.get(planeGeometry);
									}
								});
							});

							var node_2 = $.sibling(node_1, 2);

							T(node_2, {
								get is() {
									return $.get(shadowCamera);
								},
								manual: true
							});

							var node_3 = $.sibling(node_2, 2);

							$.snippet(node_3, () => $$props.children ?? $.noop, () => ({ ref: group }));
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	return $.pop($$exports);
}