import * as $ from 'svelte/internal/server';
import ChipInput from '@smui-extra/chip-input';

export default function _Autocomplete($$renderer) {
	let categories = ['Productivity', 'Audio & Video'];
	let value = '';

	const categoryList = [
		'Productivity',
		'Graphics & Photography',
		'Audio & Video',
		'Education',
		'Games',
		'Networking',
		'Developer Tools',
		'Science',
		'System',
		'Utilities'
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function chipTrailingAction($$renderer) {
				$$renderer.push(`<!---->cancel`);
			}

			function label($$renderer) {
				$$renderer.push(`<!---->Categories`);
			}

			ChipInput($$renderer, {
				chipTrailingAction$class: 'material-icons',
				'chipTrailingAction$aria-label': 'Remove category',
				autocomplete$options: categoryList.filter((category) => !categories.find((cat) => cat === category)),
				autocomplete$showMenuWithNoInput: true,
				get chips() {
					return categories;
				},

				set chips($$value) {
					categories = $$value;
					$$settled = false;
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},
				chipTrailingAction,
				label,
				$$slots: { chipTrailingAction: true, label: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}