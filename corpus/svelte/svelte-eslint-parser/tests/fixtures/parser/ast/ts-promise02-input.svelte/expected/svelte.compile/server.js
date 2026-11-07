import * as $ from 'svelte/internal/server';

export default function Ts_promise02_input($$renderer) {
	$.await(
		$$renderer,
		Promise.resolve(1),
		() => {
			$$renderer.push(`<p>...waiting</p>`);
		},
		(number) => {
			$$renderer.push(`<p>The number is ${$.escape(number)}</p>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		Promise.resolve(1),
		() => {
			$.await(
				$$renderer,
				Promise.resolve('str'),
				() => {
					$$renderer.push(`<p>...waiting</p>`);
				},
				(s) => {
					$$renderer.push(`<p>The string is ${$.escape(s)}</p>`);
				}
			);

			$$renderer.push(`<!--]-->`);
		},
		(number) => {
			$$renderer.push(`<p>The number is ${$.escape(number)}</p>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		Promise.resolve(true),
		() => {
			$$renderer.push(`<p>...waiting</p>`);
		},
		(b) => {
			$$renderer.push(`<p>The boolean is ${$.escape(b)}</p>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		Promise.resolve(1),
		() => {
			$$renderer.push(`<p>...waiting</p>`);
		},
		(number) => {
			$$renderer.push(`<p>The number is ${$.escape(number)}</p>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		Promise.resolve(1),
		() => {
			$$renderer.push(`<p>...waiting</p>`);
		},
		(number) => {
			$$renderer.push(`<p>The number is ${$.escape(number)}</p>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		Promise.resolve(1),
		() => {
			$$renderer.push(`<p>...waiting</p>`);
		},
		(number) => {
			$$renderer.push(`<p>The number is ${$.escape(number)}</p>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		Promise.resolve(1),
		() => {
			$$renderer.push(`<p>...waiting</p>`);
		},
		(number) => {
			$$renderer.push(`<p>The number is ${$.escape(number)}</p>`);
		}
	);

	$$renderer.push(`<!--]-->`);
}