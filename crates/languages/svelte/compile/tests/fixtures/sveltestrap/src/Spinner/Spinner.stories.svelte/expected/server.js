import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import Spinner from './Spinner.svelte';

export const meta = {
	title: 'Stories/Spinner',
	component: Spinner,
	parameters: {},
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		type: { control: { type: 'select' }, options: ['border', 'grow'] },
		size: { control: { type: 'select' }, options: ['', 'sm'] },
		color: {
			control: { type: 'select' },
			options: [
				'primary',
				'secondary',
				'success',
				'danger',
				'warning',
				'info',
				'light',
				'dark'
			]
		}
	},
	args: { type: 'border', size: '', color: 'primary' }
};

export default function Spinner_stories($$renderer) {
	const colors = [
		'primary',
		'secondary',
		'success',
		'danger',
		'warning',
		'info',
		'light',
		'dark'
	];

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(colors);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let color = each_array[$$index];

					Spinner($$renderer, $.spread_props([args, { color }]));
				}

				$$renderer.push(`<!--]-->`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Basic' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Types',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array_1 = $.ensure_array_like(colors);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let color = each_array_1[$$index_1];

				Spinner($$renderer, { type: 'border', color });
			}

			$$renderer.push(`<!--]--> <br/> <!--[-->`);

			const each_array_2 = $.ensure_array_like(colors);

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let color = each_array_2[$$index_2];

				Spinner($$renderer, { type: 'grow', color });
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Sizes',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array_3 = $.ensure_array_like(colors);

			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let color = each_array_3[$$index_3];

				Spinner($$renderer, { size: 'sm', color });
			}

			$$renderer.push(`<!--]--> <br/> <!--[-->`);

			const each_array_4 = $.ensure_array_like(colors);

			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let color = each_array_4[$$index_4];

				Spinner($$renderer, { size: 'sm', type: 'grow', color });
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}