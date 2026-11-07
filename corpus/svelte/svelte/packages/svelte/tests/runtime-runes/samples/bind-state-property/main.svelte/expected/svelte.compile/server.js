import * as $ from 'svelte/internal/server';
import CheckBox from './CheckBox.svelte';

export default function Main($$renderer) {
	let checked = false;

	function wrap() {
		return {
			get checked() {
				return checked;
			},

			set checked(v) {
				checked = v;
			}
		};
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (true) {
			$$renderer.push('<!--[0-->');

			const obj = wrap();

			CheckBox($$renderer, {
				type: 'checkbox',
				get checked() {
					return obj.checked;
				},

				set checked($$value) {
					obj.checked = $$value;
					$$settled = false;
				}
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <br/> Checked: ${$.escape(checked)}`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}