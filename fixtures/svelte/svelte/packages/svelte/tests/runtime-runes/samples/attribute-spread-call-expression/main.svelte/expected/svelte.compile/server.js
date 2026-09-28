import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let tag = 'button';
		let values = { a: 'red', b: 'red', c: 'red', d: 'red' };
		let count = 0;

		const factory = (name) => {
			count++;

			// check that spread effects are isolated from each other
			if (count > 8) throw new Error('too many calls');

			return {
				class: values[name],
				onclick: () => {
					values[name] = 'blue';
				}
			};
		};

		$$renderer.push(`<button${$.attributes({ ...factory('a') })}>${$.escape(values.a)}</button> <button${$.attributes({ ...factory('b') })}>${$.escape(values.b)}</button> `);

		$.element(
			$$renderer,
			tag,
			() => {
				$$renderer.push(`${$.attributes({ ...factory('c') })}`);
			},
			() => {
				$$renderer.push(`${$.escape(values.c)}`);
			}
		);

		$$renderer.push(` `);

		$.element(
			$$renderer,
			tag,
			() => {
				$$renderer.push(`${$.attributes({ ...factory('d') })}`);
			},
			() => {
				$$renderer.push(`${$.escape(values.d)}`);
			}
		);
	});
}