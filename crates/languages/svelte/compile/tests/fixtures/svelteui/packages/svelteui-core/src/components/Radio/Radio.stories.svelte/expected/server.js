import * as $ from 'svelte/internal/server';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import RadioGroup from './RadioGroup/RadioGroup.svelte';
import { Radio } from './index';

export default function Radio_stories($$renderer) {
	const spacings = ['xs', 'sm', 'md', 'lg', 'xl'];
	const directions = ['column', 'row'];
	let bindValue = 'three';
	let bindGroup = 'two';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Meta($$renderer, { title: 'Components/Radio', component: Radio });
		$$renderer.push(`<!----> `);

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					Radio($$renderer, $.spread_props([args, { checked: true }]));
					$$renderer.push(`<!----> `);
					Radio($$renderer, $.spread_props([args]));
					$$renderer.push(`<!---->`);
				}
			}
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Default',
			args: { label: 'Default Radio' },
			id: 'radioStory',
			children: ($$renderer) => {
				Radio($$renderer, { checked: true, label: 'Default Radio' });
				$$renderer.push(`<!----> `);
				Radio($$renderer, { label: 'Default Radio' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Label Direction',
			id: 'radioLabelDirectionStory',
			children: ($$renderer) => {
				Radio($$renderer, {
					labelDirection: 'right',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Right label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Radio($$renderer, {
					labelDirection: 'left',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Left label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Bind value',
			id: 'radioBindStory',
			children: ($$renderer) => {
				RadioGroup($$renderer, {
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

				$$renderer.push(`<!----> <p>Variable bound to value: <code>${$.escape(bindValue)}</code></p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Bind group',
			id: 'radioBindGroupStory',
			children: ($$renderer) => {
				RadioGroup($$renderer, {
					items: [
						{ label: 'One', value: 'one' },
						{ label: 'Two', value: 'two' },
						{ label: 'Three', value: 'three' }
					],

					get group() {
						return bindGroup;
					},

					set group($$value) {
						bindGroup = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <p>Variable bound to group: <code>${$.escape(bindGroup)}</code></p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Spacing',
			id: 'radioSpacingStory',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(spacings);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let spacing = each_array[$$index];

					$$renderer.push(`<p>Spacing: ${$.escape(spacing)}</p> `);

					RadioGroup($$renderer, {
						spacing,
						size: spacing,
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
			id: 'radioDirectionsStory',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(directions);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let direction = each_array_1[$$index_1];

					$$renderer.push(`<p>Direction: ${$.escape(direction)}</p> `);

					RadioGroup($$renderer, {
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
			id: 'radioLabelStory',
			children: ($$renderer) => {
				RadioGroup($$renderer, {
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