import * as $ from 'svelte/internal/server';

export default function Select_value($$renderer) {
	let picked = 1;
	let label = 'two';
	let fallback = 'b';
	$$renderer.select({ value: picked, onchange: (e) => picked = +e.currentTarget.value }, ($$renderer) => {
		$$renderer.option({ value: 1 }, ($$renderer) => {
			$$renderer.push(`one`);
		});
		$$renderer.option({ value: picked + 1 }, ($$renderer) => {
			$$renderer.push(`${$.escape(label)}`);
		});
		$$renderer.option({}, label);
	});
	$$renderer.push(` `);
	$$renderer.select({ defaultValue: fallback }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`a`);
		});
		$$renderer.option({ value: 'b', selected: true }, ($$renderer) => {
			$$renderer.push(`b`);
		});
	});
	$$renderer.push(` <select>`);
	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`static`);
	});
	$$renderer.option({ disabled: true, value: '' }, ($$renderer) => {
		$$renderer.push(`none`);
	});
	$$renderer.push(`</select> <button type="button">more</button>`);
}
