import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { items } = $$props;

	$$renderer.push(`<ul><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<li>${$.escape(item.name)}</li>`);
	}

	$$renderer.push(`<!--]--></ul> <ul><!--[-->`);

	const each_array_1 = $.ensure_array_like(items);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let item = each_array_1[$$index_1];

		$$renderer.push(`<li>${$.escape(item.name)}</li>`);
	}

	$$renderer.push(`<!--]--></ul> <ul><!--[-->`);

	const each_array_2 = $.ensure_array_like(items);

	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		let item = each_array_2[$$index_2];

		$$renderer.push(`<li>${$.escape(item.name)}</li>`);
	}

	$$renderer.push(`<!--]--></ul> <!--[-->`);

	const each_array_3 = $.ensure_array_like(items);

	for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
		let item = each_array_3[$$index_3];

		$$renderer.push(`<li>${$.escape(item.name)}</li> <li>${$.escape(item.name)}</li>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_4 = $.ensure_array_like(items);

	for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
		let item = each_array_4[$$index_4];

		$$renderer.push(`<li>${$.escape(item.name)}</li> <li>${$.escape(item.name)}</li>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_5 = $.ensure_array_like(items);

	for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
		let item = each_array_5[$$index_5];

		$$renderer.push(`<li>${$.escape(item.name)}</li> <li>${$.escape(item.name)}</li>`);
	}

	$$renderer.push(`<!--]-->`);
}