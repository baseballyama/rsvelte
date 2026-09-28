import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let show_extra = false;
	const attributes = { 'aria-label': 'choice' };

	function toggle() {
		show_extra = !show_extra;
	}

	$$renderer.select({ ...attributes }, ($$renderer) => {
		$$renderer.option({ value: '' }, ($$renderer) => {
			$$renderer.push(`Choose an option`);
		});

		$$renderer.option({ value: 'first' }, ($$renderer) => {
			$$renderer.push(`First`);
		});

		if (show_extra) {
			$$renderer.push('<!--[0-->');

			$$renderer.option({ value: 'extra' }, ($$renderer) => {
				$$renderer.push(`Extra`);
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});

	$.bind_props($$props, { toggle });
}