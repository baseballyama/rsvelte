import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (hello) {
		$$renderer.push('<!--[0-->');

		$.await($$renderer, aPromise, () => {}, (hello) => {
			$$renderer.push(`${$.escape(hello)}`);
		});

		$$renderer.push(`<!--]--> `);

		$.await($$renderer, aPromise, () => {}, (foo) => {
			const hello = foo;

			$$renderer.push(`${$.escape(hello)}`);
		});

		$$renderer.push(`<!--]--> `);

		$.await($$renderer, aPromise, () => {}, (hi) => {
			$$renderer.push(`${$.escape(hello)}`);
		});

		$$renderer.push(`<!--]--> `);

		$.await($$renderer, hello, () => {}, (hello) => {
			$$renderer.push(`${$.escape(hello)} `);

			if (hello) {
				$$renderer.push('<!--[0-->');

				$.await(
					$$renderer,
					aPromise,
					() => {
						$$renderer.push(`${$.escape(hello)}`);
					},
					() => {}
				);

				$$renderer.push(`<!--]--> `);

				$.await(
					$$renderer,
					aPromise,
					() => {
						$$renderer.push(`${$.escape(hello)}`);
					},
					() => {}
				);

				$$renderer.push(`<!--]--> `);

				$.await($$renderer, x, () => {}, (hello) => {
					if (hello) {
						$$renderer.push(`<!--[0-->${$.escape(hello)}`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				});

				$$renderer.push(`<!--]--> `);

				$.await($$renderer, x, () => {}, (foo) => {
					const hello = foo;

					if (hello) {
						$$renderer.push(`<!--[0-->${$.escape(hello)}`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				});

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<!--]--> `);

		if (hi && bye) {
			$$renderer.push('<!--[0-->');

			$.await($$renderer, x, () => {}, (bye) => {
				$$renderer.push(`${$.escape(bye)}`);
			});

			$$renderer.push(`<!--]-->`);
		} else if (cool) {
			$$renderer.push('<!--[1-->');

			$.await(
				$$renderer,
				cool,
				() => {
					$$renderer.push(`loading`);
				},
				(cool) => {
					if (cool) {
						$$renderer.push(`<!--[0-->${$.escape(cool)}`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}
			);

			$$renderer.push(`<!--]--> `);

			$.await(
				$$renderer,
				aPromise,
				() => {
					$$renderer.push(`loading`);
				},
				(cool) => {
					$$renderer.push(`${$.escape(cool)}`);
				}
			);

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			$.await($$renderer, x, () => {}, (hello) => {
				if (hello) {
					$$renderer.push(`<!--[0-->${$.escape(hello)}`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			});

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		cool,
		() => {
			if (cool) {
				$$renderer.push(`<!--[0-->${$.escape(cool)}`);
			} else if (hello) {
				$$renderer.push(`<!--[1-->${$.escape(hello)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		},
		(cool) => {
			if (cool) {
				$$renderer.push(`<!--[0-->${$.escape(cool)}`);
			} else if (hello) {
				$$renderer.push(`<!--[1-->${$.escape(hello)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}
	);

	$$renderer.push(`<!--]-->`);
}