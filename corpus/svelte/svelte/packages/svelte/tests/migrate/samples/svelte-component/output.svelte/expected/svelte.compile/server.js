import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ [key: string]: any }} */
		let { $$slots, $$events, ...rest } = $$props;

		let Component;
		let fallback;
		const SvelteComponent_10 = $.derived(() => Math.random() > .5 ? rest.heads : rest.tail);

		function test($$renderer) {
			const stuff = true;
			const SvelteComponent_27 = stuff && Component;

			$$renderer.push(`<li>`);

			if (SvelteComponent_27) {
				$$renderer.push('<!--[-->');
				SvelteComponent_27($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</li>`);
		}

		{
			function children($$renderer, { Comp }) {
				if (Comp) {
					$$renderer.push('<!--[-->');
					Comp($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Component($$renderer, { children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function children($$renderer, { comp }) {
				const SvelteComponent = comp;

				if (SvelteComponent) {
					$$renderer.push('<!--[-->');
					SvelteComponent($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Component($$renderer, { children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function children($$renderer, { comp: stuff }) {
				const SvelteComponent_1 = stuff;

				if (SvelteComponent_1) {
					$$renderer.push('<!--[-->');
					SvelteComponent_1($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Component($$renderer, { children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function x($$renderer, { comp: stuff }) {
				const SvelteComponent_2 = stuff;

				$$renderer.push(`<div>`);

				if (SvelteComponent_2) {
					$$renderer.push('<!--[-->');
					SvelteComponent_2($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div>`);
			}

			Component($$renderer, { x, $$slots: { x: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function x($$renderer, { comp: stuff }) {
				const SvelteComponent_3 = stuff;

				if (SvelteComponent_3) {
					$$renderer.push('<!--[-->');
					SvelteComponent_3($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Component($$renderer, { x, $$slots: { x: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function x($$renderer, { comp: stuff }) {
				const SvelteComponent_4 = stuff;

				$.element($$renderer, "div", void 0, () => {
					if (SvelteComponent_4) {
						$$renderer.push('<!--[-->');
						SvelteComponent_4($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				});
			}

			Component($$renderer, { x, $$slots: { x: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function children($$renderer, { Comp }) {
				if (Comp) {
					$$renderer.push('<!--[-->');
					Comp($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Component($$renderer, { children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function children($$renderer, { comp }) {
				const SvelteComponent_5 = comp;

				if (SvelteComponent_5) {
					$$renderer.push('<!--[-->');
					SvelteComponent_5($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Component($$renderer, { children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function children($$renderer, { comp: stuff }) {
				const SvelteComponent_6 = stuff;

				if (SvelteComponent_6) {
					$$renderer.push('<!--[-->');
					SvelteComponent_6($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Component($$renderer, { children, $$slots: { default: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function x($$renderer, { comp: stuff }) {
				const SvelteComponent_7 = stuff;

				$$renderer.push(`<div>`);

				if (SvelteComponent_7) {
					$$renderer.push('<!--[-->');
					SvelteComponent_7($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div>`);
			}

			Component($$renderer, { x, $$slots: { x: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function x($$renderer, { comp: stuff }) {
				const SvelteComponent_8 = stuff;

				if (SvelteComponent_8) {
					$$renderer.push('<!--[-->');
					SvelteComponent_8($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Component($$renderer, { x, $$slots: { x: true } });
		}

		$$renderer.push(`<!----> `);

		{
			function x($$renderer, { comp: stuff }) {
				const SvelteComponent_9 = stuff;

				$.element($$renderer, "div", void 0, () => {
					if (SvelteComponent_9) {
						$$renderer.push('<!--[-->');
						SvelteComponent_9($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				});
			}

			Component($$renderer, { x, $$slots: { x: true } });
		}

		$$renderer.push(`<!----> `);
		Component($$renderer, {});
		$$renderer.push(`<!----> `);
		Component($$renderer, { prop: true, value: '' });
		$$renderer.push(`<!----> `);

		if (SvelteComponent_10()) {
			$$renderer.push('<!--[-->');
			SvelteComponent_10()($$renderer, { prop: true, value: '' });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		Component($$renderer, { prop: true, value: '' });
		$$renderer.push(`<!----> `);

		if (SvelteComponent_10()) {
			$$renderer.push('<!--[-->');
			SvelteComponent_10()($$renderer, { prop: true, value: '' });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (true) {
			$$renderer.push('<!--[0-->');

			const x = { Component };
			const SvelteComponent_12 = x['Component'];

			if (SvelteComponent_12) {
				$$renderer.push('<!--[-->');
				SvelteComponent_12($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (true) {
			$$renderer.push('<!--[0-->');

			const x = { Component };

			if (x.Component) {
				$$renderer.push('<!--[-->');
				x.Component($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array = $.ensure_array_like([]);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let component = each_array[$$index];
			const SvelteComponent_13 = component;

			if (SvelteComponent_13) {
				$$renderer.push('<!--[-->');
				SvelteComponent_13($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array_1 = $.ensure_array_like([]);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let Component = each_array_1[$$index_1];

			if (Component) {
				$$renderer.push('<!--[-->');
				Component($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array_2 = $.ensure_array_like([]);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let component = each_array_2[$$index_2];
			const Comp = component.component;

			if (Comp) {
				$$renderer.push('<!--[-->');
				Comp($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array_3 = $.ensure_array_like([]);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let component = each_array_3[$$index_3];
			const comp = component.component;
			const SvelteComponent_14 = comp;

			if (SvelteComponent_14) {
				$$renderer.push('<!--[-->');
				SvelteComponent_14($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--> `);

		$.await(
			$$renderer,
			Promise.resolve(),
			() => {
				const SvelteComponent_15 = fallback;

				Component($$renderer, {});
				$$renderer.push(`<!----> `);

				if (SvelteComponent_15) {
					$$renderer.push('<!--[-->');
					SvelteComponent_15($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			(something) => {
				const SvelteComponent_16 = something;

				if (SvelteComponent_16) {
					$$renderer.push('<!--[-->');
					SvelteComponent_16($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		);

		$$renderer.push(`<!--]--> `);

		$.await($$renderer, Promise.resolve(), () => {}, (Something) => {
			if (Something) {
				$$renderer.push('<!--[-->');
				Something($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		});

		$$renderer.push(`<!--]--> `);

		Component($$renderer, {
			children: ($$renderer) => {
				const stuff = true;
				const SvelteComponent_18 = stuff && Component;

				$$renderer.push(`<div><p>`);

				if (SvelteComponent_18) {
					$$renderer.push('<!--[-->');
					SvelteComponent_18($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</p></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Component($$renderer, {
			children: ($$renderer) => {
				const stuff = true;
				const SvelteComponent_19 = stuff && Component;

				$$renderer.push(`<div><p>`);

				if (SvelteComponent_19) {
					$$renderer.push('<!--[-->');
					SvelteComponent_19($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</p></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <!--[-->`);

		const each_array_4 = $.ensure_array_like([]);

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let i = each_array_4[$$index_4];
			const stuff = true;
			const SvelteComponent_20 = stuff && Component;

			$$renderer.push(`<li>`);

			if (SvelteComponent_20) {
				$$renderer.push('<!--[-->');
				SvelteComponent_20($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</li>`);
		}

		$$renderer.push(`<!--]--> `);

		$.await(
			$$renderer,
			stuff,
			() => {
				const stuff = true;
				const SvelteComponent_21 = stuff && Component;

				$$renderer.push(`<li>`);

				if (SvelteComponent_21) {
					$$renderer.push('<!--[-->');
					SvelteComponent_21($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</li>`);
			},
			(x) => {
				const stuff = true;
				const SvelteComponent_22 = stuff && Component;

				$$renderer.push(`<li>`);

				if (SvelteComponent_22) {
					$$renderer.push('<!--[-->');
					SvelteComponent_22($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</li>`);
			}
		);

		$$renderer.push(`<!--]--> `);

		$.await($$renderer, stuff, () => {}, (x) => {
			const stuff = true;
			const SvelteComponent_24 = stuff && Component;

			$$renderer.push(`<li>`);

			if (SvelteComponent_24) {
				$$renderer.push('<!--[-->');
				SvelteComponent_24($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</li>`);
		});

		$$renderer.push(`<!--]--> `);

		if (true) {
			$$renderer.push('<!--[0-->');

			const stuff = true;
			const SvelteComponent_26 = stuff && Component;

			$$renderer.push(`<li>`);

			if (SvelteComponent_26) {
				$$renderer.push('<!--[-->');
				SvelteComponent_26($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</li>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Component($$renderer, {
			children: ($$renderer) => {
				Nested($$renderer, {
					children: ($$renderer) => {
						const SvelteComponent_28 = stuff && Component;

						if (SvelteComponent_28) {
							$$renderer.push('<!--[-->');
							SvelteComponent_28($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}