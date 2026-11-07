import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(vals);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let val = each_array[index];

			Child($$renderer, { id: val, count, increment });
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { done, getCounter });
	});
}