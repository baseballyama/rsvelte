import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { width, height } from './stores';
import { PoissonDiscSample as Sampler } from './sampling';
import Trees from './assets/tree.svelte';
import Bushes from './assets/bush.svelte';
import Rocks from './assets/rock.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Random($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root();
	var node = $.first_child(fragment);

	Bushes(node, {
		get transformData() {
			return $.get(smallObjects);
		}
	});

	var node_1 = $.sibling(node, 2);

	Trees(node_1, {
		get transformData() {
			return $.get(mediumObjects);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Rocks(node_2, {
		get transformData() {
			return $.get(largeObjects);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}