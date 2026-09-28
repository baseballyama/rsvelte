import * as $ from 'svelte/internal/server';
import { resolvePropertyPath, useLoader } from '@threlte/core';
import { Binding } from 'svelte-tweakpane-ui';
import * as plugin from '@kitschpatrol/tweakpane-image-plugin';
import { TextureLoader } from 'three';

export default function TransactionalTextureImage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ref = void 0;
		let { objects, key, label } = $$props;
		const firstObject = $.derived(() => objects[0]);
		const carrier = {};
		const { target, key: targetKey } = resolvePropertyPath(firstObject(), key);

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

		const obj = $.derived(() => ({ textureSrc: textureSrc() }));
		const loader = useLoader(TextureLoader);

		const onChangeHandler = (e) => {
			const tex = loader.load(e.value.src);

			tex.then((texture) => {
				objects.forEach((object) => {
					const { target, key: targetKey } = resolvePropertyPath(object, key);

					target[targetKey] = texture;

					// check for needsUpdate
				});
			});
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Binding($$renderer, {
				object: obj(),
				key: 'textureSrc',
				label,
				plugin,
				options: { view: 'input-image' },
				get ref() {
					return ref;
				},

				set ref($$value) {
					ref = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}