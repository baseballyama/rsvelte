import * as $ from 'svelte/internal/server';
import Autocomplete from '@smui-extra/autocomplete';

export default function _Objects($$renderer) {
	// When options are objects, you need to wrap them in a $state rune, so that
	// Svelte can compare the objects properly.
	let options = [
		{ id: 0, label: 'One' },
		{ id: 1, label: 'Two' },
		{ id: 2, label: 'Three' },
		{ id: 3, label: 'Four' },
		{ id: 4, label: 'Five' }
	];

	let value = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		Autocomplete($$renderer, {
			options,
			getOptionLabel: (option) => option ? `${option.label} (${option.id})` : '',
			label: 'Objects',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(value ? JSON.stringify(value) : '')}</pre></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}