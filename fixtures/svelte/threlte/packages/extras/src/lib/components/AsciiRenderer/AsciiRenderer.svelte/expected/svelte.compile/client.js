import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js';
import { fromStore } from 'svelte/store';
import { useTask, useThrelte } from '@threlte/core';

export default function AsciiRenderer($$anchor, $$props) {
	$.push($$props, true);

	const defaultCharacters = ' .:-+*=%@#';

	let autoRender = $.prop($$props, 'autoRender', 3, true),
		bgColor = $.prop($$props, 'bgColor', 3, '#000000'),
		characters = $.prop($$props, 'characters', 3, defaultCharacters),
		fgColor = $.prop($$props, 'fgColor', 3, '#ffffff'),
		options = $.prop($$props, 'options', 19, () => ({}));

	const {
		autoRender: threlteAutoRender,
		camera: defaultCamera,
		renderStage,
		renderer,
		canvas,
		dom,
		scene: defaultScene,
		size
	} = useThrelte();

	// note || instead of ?? handles the case where `characters` === ''
	const charSet = $.derived(() => characters() || defaultCharacters);

	const asciiEffect = $.derived(() => {
		const effect = new AsciiEffect(renderer, $.get(charSet), options());

		effect.domElement.style.position = 'absolute';
		effect.domElement.style.top = '0px';
		effect.domElement.style.left = '0px';
		effect.domElement.style.pointerEvents = 'none';

		return effect;
	});

	const getEffect = () => $.get(asciiEffect);
	const sizeStore = fromStore(size);

	$.user_pre_effect(() => {
		$.get(asciiEffect).setSize(sizeStore.current.width, sizeStore.current.height);
	});

	$.user_pre_effect(() => {
		$.get(asciiEffect).domElement.style.color = fgColor();
	});

	$.user_pre_effect(() => {
		$.get(asciiEffect).domElement.style.backgroundColor = bgColor();
	});

	$.user_effect(() => {
		canvas.style.opacity = '0';

		const last = $.get(asciiEffect).domElement;

		dom.appendChild(last);

		return () => {
			canvas.style.opacity = '1';
			dom.removeChild(last);
		};
	});

	let running = $.state(false);

	useTask(
		() => {
			$.get(asciiEffect).render($$props.scene ?? defaultScene, $$props.camera ?? defaultCamera.current);
		},
		{
			autoInvalidate: false,
			stage: renderStage,
			running: () => $.get(running)
		}
	);

	const start = () => {
		$.set(running, true);
		$$props.onstart?.();
	};

	const stop = () => {
		$.set(running, false);
		$$props.onstop?.();
	};

	$.user_effect(() => {
		if (!autoRender()) {
			return;
		}

		start();

		return () => {
			// this should stop the task on unmount as well
			stop();
		};
	});

	$.user_effect(() => {
		const lastAutoRender = threlteAutoRender.current;

		threlteAutoRender.set(!autoRender());

		return () => {
			threlteAutoRender.set(lastAutoRender);
		};
	});

	var $$exports = { getEffect, start, stop };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ asciiEffect: $.get(asciiEffect) }));
	$.append($$anchor, fragment);

	return $.pop($$exports);
}