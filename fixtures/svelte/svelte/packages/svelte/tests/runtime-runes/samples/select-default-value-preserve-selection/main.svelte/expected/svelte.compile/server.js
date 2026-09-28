import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let unmatched = 'zzz';
	let nothing = null;
	let defaultValue = 'b';
	let props = { defaultValue: 'b', class: 'one' };
	let late = [];
	let options = ['a', 'b', 'c'];

	$$renderer.select({ value: null, defaultValue }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ value: unmatched, defaultValue }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ ...props, value: nothing }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ defaultValue: 'b' }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(late);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.option({ value: option }, ($$renderer) => {
				$$renderer.push(`${$.escape(option)}`);
			});
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(` `);

	$$renderer.select({ defaultValue }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array_1 = $.ensure_array_like(options);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let option = each_array_1[$$index_1];

			$$renderer.option({ value: option }, ($$renderer) => {
				$$renderer.push(`${$.escape(option)}`);
			});
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(` <button>change default</button> <button>change class</button> <button>load options</button> <button>add option</button> <p>${$.escape(unmatched)} ${$.escape(String(nothing))}</p>`);
}