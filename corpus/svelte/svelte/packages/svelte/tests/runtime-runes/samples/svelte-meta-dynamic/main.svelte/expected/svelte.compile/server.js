import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let condition = false;

	$$renderer.push(`<button>toggle</button> `);

	$.element($$renderer, 'p', void 0, () => {
		$$renderer.push(`before`);
	});

	$$renderer.push(` `);

	if (condition) {
		$$renderer.push('<!--[0-->');

		$.element($$renderer, 'strong', void 0, () => {
			$$renderer.push(`during`);
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	$.element($$renderer, 'p', void 0, () => {
		$$renderer.push(`after`);
	});
}