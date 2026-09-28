import * as $ from 'svelte/internal/server';
import { width, height } from './stores';
import { PoissonDiscSample as Sampler } from './sampling';
import Trees from './assets/tree.svelte';
import Bushes from './assets/bush.svelte';
import Rocks from './assets/rock.svelte';

export default function Random($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// The following components started as copies from https://fun-bit.vercel.app/
		const pointsMatrix = [
			{ radius: 6, desription: 'large', density: 15 },
			{ radius: 4, desription: 'medium', density: 35 },
			{ radius: 2, desription: 'small', density: 50 }
		];

		const sampler = new Sampler(pointsMatrix, { width, height }, undefined, Math.random);
		const points = sampler.generatePoints();

		const smallObjects = $.derived(() => points.filter((obj) => obj.desription == 'small').map((value) => {
			return [value.x, value.y, Math.random(), Math.random()];
		}));

		const mediumObjects = $.derived(() => points.filter((obj) => obj.desription == 'medium').map((value) => {
			return [value.x, value.y, Math.random(), Math.random()];
		}));

		const largeObjects = $.derived(() => points.filter((obj) => obj.desription == 'large').map((value) => {
			return [value.x, value.y, Math.random(), Math.random()];
		}));

		Bushes($$renderer, { transformData: smallObjects() });
		$$renderer.push(`<!----> `);
		Trees($$renderer, { transformData: mediumObjects() });
		$$renderer.push(`<!----> `);
		Rocks($$renderer, { transformData: largeObjects() });
		$$renderer.push(`<!---->`);
	});
}