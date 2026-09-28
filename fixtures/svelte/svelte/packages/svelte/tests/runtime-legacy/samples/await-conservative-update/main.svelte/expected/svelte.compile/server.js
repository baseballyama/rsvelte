import * as $ from 'svelte/internal/server';
import { sleep } from './sleep.js';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		const get_promise = () => {
			return sleep(10).then(() => {
				count += 1;

				return 42;
			});
		};

		$.await(
			$$renderer,
			get_promise(),
			() => {
				$$renderer.push(`<p>loading...</p>`);
			},
			(value) => {
				$$renderer.push(`<p>the answer is ${$.escape(value)}</p> <p>count: ${$.escape(count)}</p>`);
			}
		);

		$$renderer.push(`<!--]-->`);
	});
}