import * as $ from 'svelte/internal/server';
import component from './foo';

export default function This_attr01_input($$renderer) {
	const style = { color: 'red' };
	let componentValue;
	let metaData = {};

	function handleChange() {}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$.css_props(
			$$renderer,
			true,
			{ '--style-props': style },
			() => {
				if (component) {
					$$renderer.push('<!--[-->');

					component($$renderer, {
						get value() {
							return componentValue;
						},

						set value($$value) {
							componentValue = $$value;
							$$settled = false;
						},

						get metaData() {
							return metaData;
						},

						set metaData($$value) {
							metaData = $$value;
							$$settled = false;
						}
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			true
		);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}