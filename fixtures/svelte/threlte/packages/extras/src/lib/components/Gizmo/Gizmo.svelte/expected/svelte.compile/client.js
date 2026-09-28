import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTask, useThrelte, useParent, observe } from '@threlte/core';
import { NoToneMapping, Vector4 } from 'three';
import { ViewportGizmo } from 'three-viewport-gizmo';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'controls',
	'renderTask',
	'ref',
	'onstart',
	'onchange',
	'onend'
]);

export default function Gizmo($$anchor, $$props) {
	$.push($$props, true);

	const $parent = () => $.store_get(parent, '$parent', $$stores);
	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	const parent = useParent();

	const {
		camera,
		renderer,
		dom,
		autoRenderTask,
		shouldRender,
		size,
		invalidate
	} = useThrelte();

	const gizmo = $.derived(() => {
		invalidate();

		return new ViewportGizmo(camera.current, renderer, { container: dom, placement: 'bottom-left', size: 86, ...rest });
	});

	$.user_pre_effect(() => {
		if (ref() !== $.get(gizmo)) {
			ref($.get(gizmo));
		}
	});

	const viewport = new Vector4();
	const cameraControls = $.derived(() => $$props.controls ?? $parent());

	useTask(
		$$props.renderTask?.key ?? Symbol('threlte-extras-gizmo-render'),
		() => {
			if (shouldRender()) {
				const toneMapping = renderer.toneMapping;

				renderer.getViewport(viewport);
				renderer.toneMapping = NoToneMapping;
				$.get(gizmo).render();
				renderer.setViewport(viewport);
				renderer.toneMapping = toneMapping;
			}
		},
		{
			autoInvalidate: false,
			...$$props.renderTask ?? { after: autoRenderTask }
		}
	);

	$.user_pre_effect(() => {
		$.get(gizmo).camera = $camera();
	});

	$.user_pre_effect(() => {
		if (!$.get(cameraControls)) return;

		if ($.get(cameraControls) instanceof OrbitControls || $.get(cameraControls) instanceof TrackballControls) {
			$.get(gizmo).target = $.get(cameraControls).target;

			const handleChange = () => {
				$.get(gizmo).update(false);
			};

			$.get(cameraControls).addEventListener('change', handleChange);

			return () => $.get(cameraControls).removeEventListener('change', handleChange);
		} else {
			const handleUpdate = () => {
				if ('getTarget' in $.get(cameraControls) && typeof $.get(cameraControls).getTarget == 'function') {
					$.get(cameraControls).getTarget($.get(gizmo).target);
					$.get(gizmo).update();
				}
			};

			const handleChange = () => {
				$.get(cameraControls).setPosition(...camera.current.position.toArray());
			};

			$.get(gizmo).addEventListener('change', handleChange);
			$.get(cameraControls).addEventListener('update', handleUpdate);

			return () => {
				$.get(gizmo).removeEventListener('change', handleChange);
				$.get(cameraControls).removeEventListener('update', handleUpdate);
			};
		}
	});

	const handleStart = (event) => {
		$.get(cameraControls).enabled = false;
		$$props.onstart?.(event);
	};

	const handleChange = (event) => {
		invalidate();
		$$props.onchange?.(event);
	};

	const handleEnd = (event) => {
		$.get(cameraControls).enabled = true;
		$$props.onend?.(event);
	};

	$.user_pre_effect(() => {
		$.get(gizmo).addEventListener('start', handleStart);
		$.get(gizmo).addEventListener('change', handleChange);
		$.get(gizmo).addEventListener('end', handleEnd);

		return () => {
			$.get(gizmo).removeEventListener('start', handleStart);
			$.get(gizmo).removeEventListener('change', handleChange);
			$.get(gizmo).removeEventListener('end', handleEnd);
		};
	});

	observe.pre(() => [size], () => {
		$.get(gizmo).update();
		invalidate();
	});

	$.user_pre_effect(() => {
		return () => $.get(gizmo).dispose();
	});

	$.pop();
	$$cleanup();
}