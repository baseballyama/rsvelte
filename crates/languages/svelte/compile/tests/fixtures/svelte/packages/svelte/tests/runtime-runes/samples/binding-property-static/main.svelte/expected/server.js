import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let pojo = { value: 1 };
		let raw = { value: 2 };
		let reactive = { value: 3 };
		let value = 4;

		let accessors = {
			get value() {
				return value;
			},

			set value(v) {
				value = v;
			}
		};

		let proxied = 5;

		let proxy = new Proxy({}, {
			get(target, prop, receiver) {
				if (prop === 'value') {
					return proxied;
				}

				return Reflect.get(target, prop, receiver);
			},

			set(target, prop, value, receiver) {
				if (prop === 'value') {
					proxied = value;

					return true;
				}

				return Reflect.set(target, prop, value, receiver);
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<input${$.attr('value', pojo.value)}/> <input${$.attr('value', raw.value)}/> `);

			Child($$renderer, {
				get value() {
					return pojo.value;
				},

				set value($$value) {
					pojo.value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Child($$renderer, {
				get value() {
					return raw.value;
				},

				set value($$value) {
					raw.value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (value) {
				$$renderer.push(`<!--[0--><div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <input${$.attr('value', reactive.value)}/> <input${$.attr('value', accessors.value)}/> <input${$.attr('value', proxy.value)}/> `);

			Child($$renderer, {
				get value() {
					return reactive.value;
				},

				set value($$value) {
					reactive.value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Child($$renderer, {
				get value() {
					return accessors.value;
				},

				set value($$value) {
					accessors.value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Child($$renderer, {
				get value() {
					return proxy.value;
				},

				set value($$value) {
					proxy.value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}