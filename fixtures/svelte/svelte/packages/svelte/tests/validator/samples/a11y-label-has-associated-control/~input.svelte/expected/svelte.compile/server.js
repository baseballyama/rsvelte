import * as $ from 'svelte/internal/server';
import LabelComponent from './label.svelte';

export default function Input($$renderer) {
	$$renderer.push(`<label>A</label> <label for="id">B</label> <label>C <input type="text"/></label> <label>D <button>D</button></label> <label>E <span></span></label> <label>F `);

	if (true) {
		$$renderer.push(`<!--[0--><input type="text"/>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></label> `);

	LabelComponent($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->G <input type="text"/>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <label${$.attributes({ ...forMightBeInHere })}>E <span></span></label>`);
}