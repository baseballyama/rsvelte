import * as $ from 'svelte/internal/server';
import { Icon, Layout } from '@appwrite.io/pink-svelte';
import Button from './button.svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import InputLine from './inputLine.svelte';

export default function InputPolygon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			values,
			nullable = false,
			minDeletableIndex = 4,
			onAddPoint,
			onAddLine,
			onDeletePoint,
			onChangePoint,
			disabled
		} = $$props;

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				gap: 's',
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(values);

					for (let index = 0, $$length = each_array.length; index < $$length; index++) {
						let value = each_array[index];

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								gap: 'xs',
								children: ($$renderer) => {
									{
										function addLineButton($$renderer) {
											if (index === values.length - 1) {
												$$renderer.push('<!--[0-->');

												Button($$renderer, {
													disabled: nullable,
													size: 'xs',
													compact: true,
													children: ($$renderer) => {
														Icon($$renderer, { icon: IconPlus, size: 's' });
														$$renderer.push(`<!----> Add line`);
													},
													$$slots: { default: true }
												});
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										}

										InputLine($$renderer, {
											disabled,
											values: value,
											onAddPoint: () => onAddPoint(index),
											nullable,
											onDeletePoint: () => onDeletePoint(index),
											onChangePoint: (pointIndex, coordIndex, newValue) => onChangePoint(index, pointIndex, coordIndex, newValue),
											allowLineDelete: index < 2,
											minDeletableIndex,
											addLineButton,
											$$slots: { addLineButton: true }
										});
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
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
	});
}