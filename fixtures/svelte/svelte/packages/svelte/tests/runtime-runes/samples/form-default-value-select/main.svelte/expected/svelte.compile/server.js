import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let selected1 = void 0;
	let selected2 = 'c';
	let selected3 = void 0;
	let selected4 = ['c'];
	let defaultValue = 'b';
	let multipleDefault = /** @type {string[] | undefined} */ (['a', 'c']);
	let options = ['a'];
	let props = { defaultValue: 'b' };

	$$renderer.push(`<form>`);

	$$renderer.select({ defaultValue, value: selected1 }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ defaultValue, value: selected2 }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ defaultValue }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ defaultValue: 'b' }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.option({ value: option }, ($$renderer) => {
				$$renderer.push(`${$.escape(option)}`);
			});
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(` `);

	$$renderer.select({ defaultValue: 'b' }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ ...props, value: selected3 }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ ...{ defaultValue: 'b' }, defaultValue: 'a' }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ multiple: true, defaultValue: multipleDefault }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select(
		{
			multiple: true,
			defaultValue: multipleDefault,
			value: selected4
		},
		($$renderer) => {
			$$renderer.option({ value: 'a' }, ($$renderer) => {
				$$renderer.push(`A`);
			});

			$$renderer.option({ value: 'b' }, ($$renderer) => {
				$$renderer.push(`B`);
			});

			$$renderer.option({ value: 'c' }, ($$renderer) => {
				$$renderer.push(`C`);
			});
		}
	);

	$$renderer.push(` <input type="reset" value="Reset"/> <button type="button" class="update">Update defaults</button> <button type="button" class="add">Add option</button> <button type="button" class="remove">Remove default</button> <button type="button" class="clear">Clear defaults</button></form> <p>${$.escape(selected1)} ${$.escape(selected2)} ${$.escape(selected3)} ${$.escape(selected4.join(','))}</p>`);
}