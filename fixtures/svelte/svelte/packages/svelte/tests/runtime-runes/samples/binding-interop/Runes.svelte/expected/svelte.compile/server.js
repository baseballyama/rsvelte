import * as $ from 'svelte/internal/server';
import Component1 from './Component1.svelte';
import Component2 from './Component2.svelte';

export default function Runes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let object1 = { value: 'foo' };
		let object2 = { value: 'foo' };

		class Frozen {
			constructor(value) {
				this.value = value;
			}
		}

		let object3 = new Frozen('foo');
		let object4 = new Frozen('foo');
		let primitive1 = 'foo';
		let primitive2 = 'foo';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<!---->${$.escape(object1.value)} `);

			Component1($$renderer, {
				get object() {
					return object1;
				},

				set object($$value) {
					object1 = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> ${$.escape(object2.value)} `);

			Component2($$renderer, {
				get object() {
					return object2;
				},

				set object($$value) {
					object2 = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (true) {
				$$renderer.push(`<!--[0-->${$.escape(object3.value)} `);

				Component1($$renderer, {
					get object() {
						return object3;
					},

					set object($$value) {
						object3 = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> ${$.escape(object4.value)} `);

				Component2($$renderer, {
					get object() {
						return object4;
					},

					set object($$value) {
						object4 = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> ${$.escape(primitive1)} `);

			Component1($$renderer, {
				get primitive() {
					return primitive1;
				},

				set primitive($$value) {
					primitive1 = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> ${$.escape(primitive2)} `);

			Component2($$renderer, {
				get primitive() {
					return primitive2;
				},

				set primitive($$value) {
					primitive2 = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}