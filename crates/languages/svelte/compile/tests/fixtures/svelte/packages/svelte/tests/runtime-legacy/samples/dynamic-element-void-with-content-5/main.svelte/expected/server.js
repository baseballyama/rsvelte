import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const tags = [{ t: 'div', content: 'hello world' }, { t: 'input' }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(tags);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let tag = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(tag.t)} <br/> `);

		$.element($$renderer, tag.t, void 0, () => {
			if (tag.t !== 'input') {
				$$renderer.push(`<!--[0-->${$.escape(tag.content)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});
	}

	$$renderer.push(`<!--]-->`);
}