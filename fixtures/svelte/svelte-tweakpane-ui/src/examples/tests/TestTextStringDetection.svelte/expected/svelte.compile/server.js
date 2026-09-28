import * as $ from 'svelte/internal/server';
import { AutoObject, AutoValue, Color, Text } from '$lib';

export default function TestTextStringDetection($$renderer) {
	// Svelte Tweakpane UI's Text component should NOT give color-like string
	// special treatment, use the Color component instead.
	//
	// Related:
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/17
	let strings = {
		sample01: 'Hi',
		sample02: '1',
		sample03: '0x13',
		sample04: '0x1337',
		sample05: '0xEE1337',
		sample06: '0x1337AA',
		sample07: '0x1337AA13',
		sample08: '#13',
		sample09: '#1337',
		sample10: '#EE1337',
		sample11: '#1337AA',
		sample12: '#1337AA13',
		sample13: '238, 19, 55',
		sample14: '238, 19, 55, 0.5',
		sample15: 'rgb(238, 19, 55)',
		sample16: 'rgba(238, 19, 55, 0.5)',
		sample17: 'hsl(238, 19, 55)',
		sample18: 'hsla(238, 19, 55, 0.5)',
		sample19: 'hsv(238, 19, 55)',
		sample20: 'hsva(238, 19, 55, 0.5)',
		sample21: 'True',
		sample22: 'true',
		sample23: 'False',
		sample24: 'false',
		sample25: 'red'
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<hr/> <h1>Text Component</h1> <!--[-->`);

		const each_array = $.ensure_array_like(Object.keys(strings));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let key = each_array[$$index];

			Text($$renderer, {
				label: key,
				get value() {
					return strings[key];
				},

				set value($$value) {
					strings[key] = $$value;
					$$settled = false;
				}
			});
		}

		$$renderer.push(`<!--]--> <hr/> <h1>Auto Value</h1> <!--[-->`);

		const each_array_1 = $.ensure_array_like(Object.keys(strings));

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let key = each_array_1[$$index_1];

			AutoValue($$renderer, {
				label: key,
				get value() {
					return strings[key];
				},

				set value($$value) {
					strings[key] = $$value;
					$$settled = false;
				}
			});
		}

		$$renderer.push(`<!--]--> <hr/> <h1>Auto Object</h1> `);

		AutoObject($$renderer, {
			get object() {
				return strings;
			},

			set object($$value) {
				strings = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <hr/> <h1>Color Component</h1> <!--[-->`);

		const each_array_2 = $.ensure_array_like(Object.keys(strings));

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let key = each_array_2[$$index_2];

			Color($$renderer, {
				label: key,
				get value() {
					return strings[key];
				},

				set value($$value) {
					strings[key] = $$value;
					$$settled = false;
				}
			});
		}

		$$renderer.push(`<!--]-->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}