import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BirchTrees from './assets/birch.svelte';
import Trees from './assets/tree.svelte';
import Bushes from './assets/bush.svelte';
import Rocks from './assets/rock.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Random($$anchor) {
	// The following components started as copies from https://fun-bit.vercel.app/
	const numberOfObjects = 50;

	const distinctObjects = 4;
	const commonRatio = 0.5;

	function calculateExponentialSumValues(total, numberOfValues, commonRatio) {
		let result = [];
		let remainingTotal = total;

		for (let i = 0; i < numberOfValues - 1; i++) {
			let term = Math.ceil(remainingTotal * (1 - commonRatio));

			result.push(term);
			remainingTotal -= term;
		}

		// The last term to ensure the sum is exactly equal to the total
		result.push(remainingTotal);

		return result;
	}

	const data = $.derived(() => {
		const exponentialSumValues = calculateExponentialSumValues(numberOfObjects, distinctObjects, commonRatio);
		const totalBushes = exponentialSumValues[0] ?? 0;
		const totalTrees = exponentialSumValues[1] ?? 0;
		const totalBirchTrees = exponentialSumValues[2] ?? 0;
		const totalRocks = exponentialSumValues[3] ?? 0;
		const randomBushes = [];
		const randomTrees = [];
		const randomBirchTrees = [];
		const randomRocks = [];

		for (let i = 0; i < totalBushes; i++) {
			randomBushes.push([Math.random(), Math.random(), Math.random(), Math.random()]);

			if (i < totalTrees) {
				randomTrees.push([Math.random(), Math.random(), Math.random(), Math.random()]);
			}

			if (i < totalBirchTrees) {
				randomBirchTrees.push([Math.random(), Math.random(), Math.random(), Math.random()]);
			}

			if (i < totalRocks) {
				randomRocks.push([Math.random(), Math.random(), Math.random(), Math.random()]);
			}
		}

		return { randomBushes, randomTrees, randomBirchTrees, randomRocks };
	});

	var fragment = root();
	var node = $.first_child(fragment);

	Bushes(node, {
		get transformData() {
			return $.get(data).randomBushes;
		}
	});

	var node_1 = $.sibling(node, 2);

	BirchTrees(node_1, {
		get transformData() {
			return $.get(data).randomBirchTrees;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Trees(node_2, {
		get transformData() {
			return $.get(data).randomTrees;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Rocks(node_3, {
		get transformData() {
			return $.get(data).randomRocks;
		}
	});

	$.append($$anchor, fragment);
}