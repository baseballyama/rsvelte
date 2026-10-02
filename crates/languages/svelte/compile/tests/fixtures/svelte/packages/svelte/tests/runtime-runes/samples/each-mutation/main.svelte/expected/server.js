import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let a = [{ text: 'foo' }];
	let b = [{ text: 'foo' }];
	let text = 'foo';

	let c = [
		{
			get text() {
				return text.toUpperCase();
			},

			set text(v) {
				text = v;
			}
		}
	];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(a);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let item = each_array[i];

		$$renderer.push(`<button>${$.escape(item.text)}</button>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(b);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let item = each_array_1[$$index_1];

		$$renderer.push(`<button>${$.escape(item.text)}</button>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_2 = $.ensure_array_like(c);

	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		let item = each_array_2[$$index_2];

		$$renderer.push(`<button>${$.escape(item.text)}</button>`);
	}

	$$renderer.push(`<!--]-->`);
}