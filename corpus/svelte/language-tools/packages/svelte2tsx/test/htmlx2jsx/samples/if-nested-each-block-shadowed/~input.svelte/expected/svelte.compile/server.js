import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (hello) {
		$$renderer.push('<!--[0-->');

		const each_array = $.ensure_array_like(items);

		if (each_array.length !== 0) {
			$$renderer.push('<!--[-->');

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let hello = each_array[i];

				$$renderer.push(`<div>${$.escape(hello)}${$.escape(i)}</div> `);

				if (hello) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array_1 = $.ensure_array_like(items);

					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let hello = each_array_1[$$index];

						if (hello) {
							$$renderer.push(`<!--[0-->${$.escape(hello)}`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--> <!--[-->`);

					const each_array_2 = $.ensure_array_like(items);

					for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
						let foo = each_array_2[$$index_1];
						const hello = foo;

						if (hello) {
							$$renderer.push(`<!--[0-->${$.escape(hello)}`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}
		} else {
			$$renderer.push('<!--[!-->');

			if (hello) {
				$$renderer.push(`<!--[0-->${$.escape(hello)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> `);

		if (hi && bye) {
			$$renderer.push('<!--[0-->');

			const each_array_3 = $.ensure_array_like(items);

			if (each_array_3.length !== 0) {
				$$renderer.push('<!--[-->');

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let bye = each_array_3[$$index_3];

					$$renderer.push(`<div>${$.escape(bye)}</div>`);
				}
			} else {
				$$renderer.push('<!--[!-->');

				if (bye) {
					$$renderer.push(`<!--[0-->${$.escape(bye)}`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else if (cool) {
			$$renderer.push(`<!--[1--><!--[-->`);

			const each_array_4 = $.ensure_array_like(items);

			for (let cool = 0, $$length = each_array_4.length; cool < $$length; cool++) {
				let item = each_array_4[cool];

				$$renderer.push(`<div>${$.escape(item)}${$.escape(cool)}</div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array_5 = $.ensure_array_like(items);

			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let hello = each_array_5[$$index_5];

				$$renderer.push(`<div>${$.escape(hello)}</div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	const each_array_6 = $.ensure_array_like(items);

	if (each_array_6.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let i = 0, $$length = each_array_6.length; i < $$length; i++) {
			let hello = each_array_6[i];

			if (hello && i && bye) {
				$$renderer.push(`<!--[0-->${$.escape(hello)} ${$.escape(i)} ${$.escape(bye)}`);
			} else if (hello && i && bye) {
				$$renderer.push(`<!--[1-->${$.escape(hello)} ${$.escape(i)} ${$.escape(bye)}`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(hello)} ${$.escape(i)} ${$.escape(bye)}`);
			}

			$$renderer.push(`<!--]-->`);
		}
	} else {
		$$renderer.push('<!--[!-->');

		if (hello && i && bye) {
			$$renderer.push(`<!--[0-->${$.escape(hello)} ${$.escape(i)} ${$.escape(bye)}`);
		} else if (hello && i && bye) {
			$$renderer.push(`<!--[1-->${$.escape(hello)} ${$.escape(i)} ${$.escape(bye)}`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(hello)} ${$.escape(i)} ${$.escape(bye)}`);
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}