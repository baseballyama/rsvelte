import * as $ from 'svelte/internal/server';

export default function Await_blocks_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		async function getRandomNumber() {
			const res = await fetch(`tutorial/random-number`);
			const text = await res.text();

			if (res.ok) {
				return text;
			} else {
				throw new Error(text);
			}
		}

		let promise = getRandomNumber();

		function handleClick() {
			promise = getRandomNumber();
		}

		$$renderer.push(`<button>generate random number</button> `);

		$.await(
			$$renderer,
			promise,
			() => {
				$$renderer.push(`<p>...waiting</p>`);
			},
			(number) => {
				$$renderer.push(`<p>The number is ${$.escape(number)}</p>`);
			}
		);

		$$renderer.push(`<!--]--> `);

		$.await($$renderer, promise, () => {}, (value) => {
			$$renderer.push(`<p>the value is ${$.escape(value)}</p>`);
		});

		$$renderer.push(`<!--]--> `);
		$.await($$renderer, promise, () => {}, () => {});
		$$renderer.push(`<!--]--> `);

		$.await($$renderer, promise, () => {}, (value) => {
			$$renderer.push(`<p>the value is ${$.escape(value)}</p>`);
		});

		$$renderer.push(`<!--]-->`);
	});
}