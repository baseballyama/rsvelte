import * as $ from 'svelte/internal/server';
import { fromAction } from 'svelte/attachments';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { count = 0 } = $$props;

		function test(node, thing) {
			const kind = node.dataset.kind;

			console.log('create', thing, kind);

			let t = thing;
			const controller = new AbortController();

			node.addEventListener(
				'click',
				() => {
					console.log(t);
				},
				{ signal: controller.signal }
			);

			return {
				update(new_thing) {
					console.log('update', new_thing, kind);
					t = new_thing;
				},

				destroy() {
					console.log('destroy', kind);
					controller.abort();
				}
			};
		}

		if (count < 2) {
			$$renderer.push(`<!--[0--><button data-kind="action"></button> <button data-kind="attachment"></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button></button>`);
	});
}