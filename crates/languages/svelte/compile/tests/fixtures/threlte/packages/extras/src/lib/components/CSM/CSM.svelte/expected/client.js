import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { observe, useTask, useThrelte } from '@threlte/core';
import { CSM } from 'three/examples/jsm/csm/CSM.js';
import { useMaterials } from './useMaterials.svelte.js';

var root = $.from_html(`<!> <!>`, 1);

export default function CSM_1($$anchor, $$props) {
	$.push($$props, true);

	const $defaultCamera = () => $.store_get(defaultCamera, '$defaultCamera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * Whether or not CSM is enabled. If `enabled={false}`, a slot named
	 * `"disabled"` will be rendered.
	 */
	/**
	 * The arguments to pass to the CSM constructor.
	 */
	/**
	 * The camera to use for CSM. Defaults to the camera set by `makeDefault`.
	 */
	/**
	 * A configuration callback, which is triggered when CSM is activated. This
	 * callback facilitates advanced configurations, such as enabling the fade
	 * feature.
	 */
	let enabled = $.prop($$props, 'enabled', 3, true),
		args = $.prop($$props, 'args', 19, () => ({})),
		lightDirection = $.prop($$props, 'lightDirection', 19, () => [1, -1, 1]);

	const { camera: defaultCamera, scene, size } = useThrelte();
	let csm = $.state(void 0);

	useTask(() => $.get(csm)?.update(), { autoInvalidate: false });

	const { onNewMaterial, allMaterials } = useMaterials();

	const disposeCsm = () => {
		$.get(csm)?.remove();
		$.get(csm)?.dispose();
		$.set(csm, undefined);
	};

	observe(() => [enabled()], ([enabled]) => {
		if (enabled) {
			const nextCSM = new CSM({
				camera: $$props.camera ?? $defaultCamera(),
				parent: scene,
				...args()
			});

			$$props.configure?.(nextCSM);

			for (const material of allMaterials) {
				nextCSM.setupMaterial(material);
			}

			onNewMaterial((material) => nextCSM.setupMaterial(material));
			$.set(csm, nextCSM);
		} else {
			onNewMaterial(undefined);
			disposeCsm();
		}
	});

	observe(() => [size, $.get(csm)], ([, csm]) => {
		csm?.updateFrustums();
	});

	// set any CSM props that require frustum updates
	observe(() => [defaultCamera, $$props.camera, $.get(csm)], ([defaultCamera, camera, csm]) => {
		if (!csm) return;

		csm.camera = camera ?? defaultCamera;

		if (args().maxFar !== undefined) csm.maxFar = args().maxFar;
		if (args().mode !== undefined) csm.mode = args().mode;

		csm.updateFrustums();
	});

	observe(() => [$.get(csm), $$props.lightIntensity, $$props.lightColor], ([csm, intensity, color]) => {
		csm?.lights.forEach((light) => {
			if (intensity !== undefined) {
				light.intensity = intensity / Math.PI;
			}

			if (color !== undefined) {
				light.color.set(color);
			}
		});
	});

	observe(() => [$.get(csm), lightDirection()], ([csm, direction]) => {
		csm?.lightDirection.set(...direction).normalize();
	});

	$.user_pre_effect(() => {
		return disposeCsm;
	});

	var fragment = root();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.snippet(node_2, () => $$props.fallback ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (!enabled()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}