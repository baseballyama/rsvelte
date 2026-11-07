import * as $ from 'svelte/internal/server';
import 'svelte/elements';

export default function Input($$renderer) {
	let tag = 'div';
	let tagString = '';
	let elementDiv;
	let elementOther;
	let elementOther2;

	() => {
		elementDiv;
		elementOther;
		elementOther2;
	};

	$.element($$renderer, tag);
	$$renderer.push(` `);

	$.element($$renderer, tag, void 0, () => {
		$$renderer.push(`div`);
	});

	$$renderer.push(` `);
	$.element($$renderer, tag);
	$$renderer.push(` `);
	$.element($$renderer, tagString);
	$$renderer.push(` `);
	$.element($$renderer, tag);
	$$renderer.push(` `);

	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr('cellpadding', 1)}`);
	});
}