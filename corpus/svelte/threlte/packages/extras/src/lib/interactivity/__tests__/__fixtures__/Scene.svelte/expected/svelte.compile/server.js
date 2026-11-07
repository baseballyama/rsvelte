import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { useInteractivity } from '../../context.js';
import { BoxGeometry, MeshBasicMaterial } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;
		const ctx = useInteractivity();
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
				name: 'A',
				geometry,
				material,
				'position.z': -5,
				onclick: props.onclickA,
				oncontextmenu: props.oncontextmenuA,
				ondblclick: props.ondblclickA,
				onwheel: props.onwheelA,
				onpointerdown: props.onpointerdownA,
				onpointerup: props.onpointerupA,
				onpointerover: props.onpointeroverA,
				onpointerout: props.onpointeroutA,
				onpointerenter: props.onpointerenterA,
				onpointerleave: props.onpointerleaveA,
				onpointermove: props.onpointermoveA,
				onpointermissed: props.onpointermissedA
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
				name: 'B',
				geometry,
				material,
				position: [10, 0, -5],
				onclick: props.onclickB,
				onpointerover: props.onpointeroverB,
				onpointerout: props.onpointeroutB,
				onpointerenter: props.onpointerenterB,
				onpointerleave: props.onpointerleaveB,
				onpointermove: props.onpointermoveB,
				onpointermissed: props.onpointermissedB
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
				name: 'C',
				geometry,
				material,
				position: [-10, 0, -5],
				onpointermissed: props.onpointermissedC
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}