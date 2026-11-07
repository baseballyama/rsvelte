import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { ChipGroup } from '../index';

export default function ChipGroup_stories($$renderer) {
	const spacings = ['xs', 'sm', 'md', 'lg', 'xl'];
	const directions = ['column', 'row'];
	let bindValue;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Meta($$renderer, { title: 'Components/Chip/ChipGroup', component: ChipGroup });
		$$renderer.push(`<!----> `);

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					ChipGroup($$renderer, $.spread_props([args]));
				}
			}
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'ChipGroup',
			args: {
				items: [
					{ label: 'Chip', value: 'chip' },
					{ label: 'Dip', value: 'dip' }
				]
			},
			id: 'chipGroupStory'
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Allow multiple',
			id: 'chipGroupMultipleStory',
			children: ($$renderer) => {
				ChipGroup($$renderer, {
					multiple: true,
					items: [
						{ label: 'One', value: 'one' },
						{ label: 'Two', value: 'two' },
						{ label: 'Three', value: 'three' }
					],

					get value() {
						return bindValue;
					},

					set value($$value) {
						bindValue = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <p>Variable bound to value: <code>${$.escape(JSON.stringify(bindValue))}</code></p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Bind value',
			id: 'chipGroupBindStory',
			children: ($$renderer) => {
				ChipGroup($$renderer, {
					items: [
						{ label: 'One', value: 'one' },
						{ label: 'Two', value: 'two' },
						{ label: 'Three', value: 'three' }
					],

					get value() {
						return bindValue;
					},

					set value($$value) {
						bindValue = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <p>Variable bound to value: <code>${$.escape(JSON.stringify(bindValue))}</code></p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Spacing',
			id: 'chipGroupSpacingStory',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(spacings);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let spacing = each_array[$$index];

					$$renderer.push(`<p>Spacing: ${$.escape(spacing)}</p> `);

					ChipGroup($$renderer, {
						spacing,
						items: [
							{ label: 'One', value: 'one' },
							{ label: 'Two', value: 'two' },
							{ label: 'Three', value: 'three' }
						],

						get value() {
							return bindValue;
						},

						set value($$value) {
							bindValue = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Directions',
			id: 'chipGroupDirectionsStory',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(directions);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let direction = each_array_1[$$index_1];

					$$renderer.push(`<p>Direction: ${$.escape(direction)}</p> `);

					ChipGroup($$renderer, {
						direction,
						items: [
							{ label: 'One', value: 'one' },
							{ label: 'Two', value: 'two' },
							{ label: 'Three', value: 'three' }
						],

						get value() {
							return bindValue;
						},

						set value($$value) {
							bindValue = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Input label',
			id: 'chipGroupLabelStory',
			children: ($$renderer) => {
				ChipGroup($$renderer, {
					multiple: true,
					label: 'Pick as many as you like',
					items: [
						{ label: 'One', value: 'one' },
						{ label: 'Two', value: 'two' },
						{ label: 'Three', value: 'three' }
					],

					get value() {
						return bindValue;
					},

					set value($$value) {
						bindValue = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}