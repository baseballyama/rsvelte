import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	function fade(node) {
		return {
			duration: 400,
			tick(t) {
				node.setAttribute('t', t);
			}
		};
	}

	let shown = true;
	let _id = 1;
	let items = [];
	const toggle = () => shown = !shown;

	const add = () => {
		items = items.concat({ _id, name: `Thing ${_id}` });
		_id++;
	};

	const remove = (id) => items = items.filter(({ _id }) => _id !== id);

	if (shown) {
		$$renderer.push(`<!--[0--><section><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let thing = each_array[$$index];

			$$renderer.push(`<div>${$.escape(thing.name)}</div>`);
		}

		$$renderer.push(`<!--]--></section>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { toggle, add, remove });
}