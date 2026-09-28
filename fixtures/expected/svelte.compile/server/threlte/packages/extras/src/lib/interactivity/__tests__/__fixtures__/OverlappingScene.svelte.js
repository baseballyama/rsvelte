import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { BoxGeometry, MeshBasicMaterial } from 'three';

export default function OverlappingScene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;
		const geometry = new BoxGeometry(2, 2, 2);
		const material = new MeshBasicMaterial();

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');
			T.PerspectiveCamera($$renderer, { makeDefault: true, args: [75, 1, 0.1, 1000], 'position.z': 0 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				name: 'Front',
				geometry,
				material,
				'position.z': -3,
				onpointerdown: props.onpointerdownFront,
				onpointerover: props.onpointeroverFront,
				onpointerout: props.onpointeroutFront,
				onpointerenter: props.onpointerenterFront,
				onpointerleave: props.onpointerleaveFront,
				onpointermove: props.onpointermoveFront
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				name: 'Back',
				geometry,
				material,
				'position.z': -7,
				onpointerdown: props.onpointerdownBack,
				onpointerover: props.onpointeroverBack,
				onpointerout: props.onpointeroutBack,
				onpointerenter: props.onpointerenterBack,
				onpointerleave: props.onpointerleaveBack,
				onpointermove: props.onpointermoveBack
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}