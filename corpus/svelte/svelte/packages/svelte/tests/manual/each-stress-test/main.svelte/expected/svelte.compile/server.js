import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const VALUES = Array.from('abcdefghijklmnopqrstuvwxyz');

		const presets = [
			// b is never destroyed
			["ab", "", "a", "abc"],

			// the final state is 'abc', not 'cba'
			["abc", "", "cba"],

			// the case in https://github.com/sveltejs/svelte/pull/17240
			["abc", "adbc", "adebc"],
			["ab", "a", "abc"],
			["a", "bc", "bcd"]

			// add more presets by hitting 'party' and copying from the console
		];

		function shuffle() {
			const values = VALUES.slice();
			const number = Math.floor(Math.random() * VALUES.length);
			let shuffled = '';

			for (let i = 0; i < number; i++) {
				shuffled += values.splice(Math.floor(Math.random() * (number - i)), 1)[0];
			}

			return shuffled;
		}

		function mark(node) {
			let prev = -1;

			return {
				duration: transition ? slow ? 5000 : 500 : 0,
				tick(t) {
					const direction = t >= prev ? 'in' : 'out';

					node.style.color = direction === 'in' ? '' : 'grey';
					prev = t;
				}
			};
		}

		const record = [];
		const sleep = (ms = slow ? 1000 : 100) => new Promise((f) => setTimeout(f, ms));

		async function test(x) {
			console.group(JSON.stringify(x));
			error = null;
			list = x;
			record.push(list);

			if (transition) {
				await sleep();
			} else {
				await tick();
				await tick();
			}

			check('reconcile');
			n += 1;
			await tick();
			check('update');
			console.groupEnd();
		}

		function check(task) {
			const expected = list.split('').map((c) => `(${c}:${n})`).join('') || '(fallback)';
			const children = Array.from(container.children);
			const filtered = children.filter((span) => !span.style.color);
			const received = filtered.map((span) => span.textContent).join('');

			if (expected !== received) {
				console.log('expected:', expected);
				console.log('received:', received);
				console.log(JSON.stringify(record, null, '  '));
				error = `failed to ${task}`;

				throw new Error(error);
			}
		}

		let list = '';
		let n = 0;
		let error = null;
		let slow = false;
		let transition = true;
		let partying = false;
		let container;

		$$renderer.push(`<h1>each block stress test</h1> <label><input type="checkbox"${$.attr('checked', transition, true)}/> transition</label> <label><input type="checkbox"${$.attr('checked', slow, true)}/> slow</label> <fieldset class="svelte-jwlrms"><legend class="svelte-jwlrms">random</legend> <button>test</button> <button>${$.escape(partying ? 'stop' : 'party')}</button></fieldset> <fieldset class="svelte-jwlrms"><legend class="svelte-jwlrms">presets</legend> <!--[-->`);

		const each_array = $.ensure_array_like(presets);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let preset = each_array[index];

			$$renderer.push(`<button>${$.escape(index + 1)}</button>`);
		}

		$$renderer.push(`<!--]--></fieldset> <form><fieldset class="svelte-jwlrms"><legend class="svelte-jwlrms">input</legend> <input/></fieldset></form> <div id="output">`);

		const each_array_1 = $.ensure_array_like(list);

		if (each_array_1.length !== 0) {
			$$renderer.push('<!--[-->');

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let c = each_array_1[$$index_1];

				$$renderer.push(`<span>(${$.escape(c)}:${$.escape(n)})</span>`);
			}
		} else {
			$$renderer.push(`<!--[!--><span>(fallback)</span>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (error) {
			$$renderer.push(`<!--[0--><p class="error svelte-jwlrms">${$.escape(error)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}