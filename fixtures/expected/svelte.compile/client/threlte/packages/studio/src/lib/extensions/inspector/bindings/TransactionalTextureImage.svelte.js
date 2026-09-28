import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolvePropertyPath, useLoader } from '@threlte/core';
import { Binding } from 'svelte-tweakpane-ui';
import * as plugin from '@kitschpatrol/tweakpane-image-plugin';
import { TextureLoader } from 'three';

export default function TransactionalTextureImage($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.state(void 0);
	const firstObject = $.derived(() => $$props.objects[0]);
	const carrier = {};
	const { target, key: targetKey } = resolvePropertyPath($.get(firstObject), $$props.key);

	if (typeof target[targetKey] === 'object' && target[targetKey] !== null && 'clone' in target[targetKey] && typeof target[targetKey].clone === 'function') {
		const cloned = target[targetKey].clone();

		carrier[targetKey] = cloned;
	} else {
		carrier[targetKey] = target[targetKey];
	}

	const textureSrc = $.derived(() => {
		if (carrier[targetKey] && carrier[targetKey].image) {
			if (carrier[targetKey].image instanceof ImageBitmap) {
				return getImageBitmapUrl(carrier[targetKey].image);
			} else if (carrier[targetKey].image instanceof HTMLImageElement) {
				return carrier[targetKey].image.src;
			}
		}

		return '';
	});

	const getImageBitmapUrl = (imageBitmap) => {
		const canvas = document.createElement('canvas');

		canvas.width = imageBitmap.width;
		canvas.height = imageBitmap.height;

		const ctx = canvas.getContext('2d');

		if (ctx) {
			ctx.drawImage(imageBitmap, 0, 0);

			return canvas.toDataURL();
		}

		return '';
	};

	const obj = $.derived(() => ({ textureSrc: $.get(textureSrc) }));
	const loader = useLoader(TextureLoader);

	const onChangeHandler = (e) => {
		const tex = loader.load(e.value.src);

		tex.then((texture) => {
			$$props.objects.forEach((object) => {
				const { target, key: targetKey } = resolvePropertyPath(object, $$props.key);

				target[targetKey] = texture;

				// check for needsUpdate
			});
		});
	};

	$.user_effect(() => {
		if (!$.get(ref)) return;

		const internalRef = $.get(ref);

		internalRef.on('change', onChangeHandler);

		return () => {
			internalRef.off('change', onChangeHandler);
		};
	});

	Binding($$anchor, {
		get object() {
			return $.get(obj);
		},
		key: 'textureSrc',
		get label() {
			return $$props.label;
		},

		get plugin() {
			return plugin;
		},
		options: { view: 'input-image' },
		get ref() {
			return $.get(ref);
		},

		set ref($$value) {
			$.set(ref, $$value, true);
		}
	});

	$.pop();
}