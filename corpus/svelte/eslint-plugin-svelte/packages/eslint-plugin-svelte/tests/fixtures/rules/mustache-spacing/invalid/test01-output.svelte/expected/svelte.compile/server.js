import * as $ from 'svelte/internal/server';
import A from 'A.svelte';

export default function Test01_output($$renderer) {
	const foo = 'foo';
	let text = '';
	let value = '';
	let input;
	const myClass = 'my-class';
	const id = 'id';
	const attrs = {};
	const bar = '<div></div>';
	const o1 = 1;
	const o2 = 2;
	const expression = true;
	const list = [];

	$$renderer.push(`<div>`);
	console.log({ o1 });

	debugger;

	console.log({ o1, o2 });

	debugger;

	$$renderer.push(`foo <input${$.attr('value', text)}${$.attr('this', input)} class="foo my-class"/> <input${$.attr('value', value)}${$.attr('id', id)}/> <input${$.attributes({ ...attrs }, void 0, void 0, void 0, 4)}/> ${$.html(bar)}  `);

	if (expression) {
		$$renderer.push(`<!--[0-->...`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (expression) {
		$$renderer.push(`<!--[0-->...`);
	} else if (expression) {
		$$renderer.push(`<!--[1-->...`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (expression) {
		$$renderer.push(`<!--[0-->...`);
	} else {
		$$renderer.push(`<!--[-1-->...`);
	}

	$$renderer.push(`<!--]--> `);

	if (expression) {
		$$renderer.push('<!--[0-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array = $.ensure_array_like(list);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<!---->...`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(list);

	for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
		let item = each_array_1[index];

		$$renderer.push(`<!---->...`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_2 = $.ensure_array_like(list);

	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		let item = each_array_2[$$index_2];

		$$renderer.push(`<!---->...`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_3 = $.ensure_array_like(list);

	for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
		let item = each_array_3[index];

		$$renderer.push(`<!---->...`);
	}

	$$renderer.push(`<!--]--> `);

	const each_array_4 = $.ensure_array_like(list);

	if (each_array_4.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let item = each_array_4[$$index_4];

			$$renderer.push(`<!---->...`);
		}
	} else {
		$$renderer.push(`<!--[!--><!---->...`);
	}

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		expression,
		() => {
			$$renderer.push(`...`);
		},
		(name) => {
			$$renderer.push(`...`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		expression,
		() => {
			$$renderer.push(`...`);
		},
		(name) => {
			$$renderer.push(`...`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, expression, () => {}, (name) => {
		$$renderer.push(`...`);
	});

	$$renderer.push(`<!--]--> `);
	$.await($$renderer, expression, () => {}, () => {});
	$$renderer.push(`<!--]--> `);

	$.await($$renderer, expression, () => {}, () => {
		$$renderer.push(`...`);
	});

	$$renderer.push(`<!--]--> `);
	$.await($$renderer, expression, () => {}, () => {});
	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		expression,
		() => {
			$$renderer.push(`...`);
		},
		() => {
			$$renderer.push(`...`);
		}
	);

	$$renderer.push(`<!--]--> <!---->`);

	{
		$$renderer.push(`...`);
	}

	$$renderer.push(`<!----></div>`);
}