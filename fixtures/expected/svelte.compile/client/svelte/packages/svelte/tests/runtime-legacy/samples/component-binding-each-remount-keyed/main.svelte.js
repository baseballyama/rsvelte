import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import Child from './Child.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let updateCounter = 0;
	let promiseResolve;

	const done = new Promise((resolve) => {
		promiseResolve = resolve;
	});

	const getCounter = () => {
		return updateCounter;
	};

	let vals = [1, 2, 3];
	const instances = [];
	let count = 3;

	const increment = () => {
		++updateCounter;
	};

	onMount(() => {
		count = 2;

		setTimeout(() => {
			vals = vals.reverse();
			setTimeout(promiseResolve);
		});
	});

	var $$exports = { done, getCounter };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 18, () => vals, (val) => val, ($$anchor, val, index) => {
		$.bind_this(
			Child($$anchor, {
				get id() {
					return val;
				},

				get count() {
					return count;
				},
				increment
			}),
			($$value, index) => instances[index] = $$value,
			(index) => instances?.[index],
			() => [$.get(index)]
		);
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}