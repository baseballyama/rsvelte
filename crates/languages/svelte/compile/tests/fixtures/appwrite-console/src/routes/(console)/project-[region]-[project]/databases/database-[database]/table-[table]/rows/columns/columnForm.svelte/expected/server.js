import * as $ from 'svelte/internal/server';
import ColumnItem from './columnItem.svelte';
import CustomId from '$lib/components/customId.svelte';
import { IconPencil } from '@appwrite.io/pink-icons-svelte';
import { Icon, Layout, Tag } from '@appwrite.io/pink-svelte';

export default function ColumnForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { columns = [], formValues = {}, customId = undefined } = $$props;
		let showCustomId = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (columns.length) {
				$$renderer.push('<!--[0-->');

				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(columns);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let column = each_array[$$index];
								const label = column.key;

								ColumnItem($$renderer, {
									label,
									column,
									formValues,
									onUpdateFormValues: (values) => formValues = values
								});
							}

							$$renderer.push(`<!--]--> `);

							if (customId !== undefined) {
								$$renderer.push('<!--[0-->');

								if (!showCustomId) {
									$$renderer.push(`<!--[0--><span>`);

									Tag($$renderer, {
										size: 's',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Row ID`);
										},

										$$slots: {
											default: true,
											start: ($$renderer) => {
												Icon($$renderer, { icon: IconPencil, slot: 'start', size: 's' });
											}
										}
									});

									$$renderer.push(`<!----></span>`);
								} else {
									$$renderer.push('<!--[-1-->');

									CustomId($$renderer, {
										autofocus: true,
										name: 'Row',
										get show() {
											return showCustomId;
										},

										set show($$value) {
											showCustomId = $$value;
											$$settled = false;
										},

										get id() {
											return customId;
										},

										set id($$value) {
											customId = $$value;
											$$settled = false;
										}
									});
								}

								$$renderer.push(`<!--]-->`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { formValues, customId });
	});
}