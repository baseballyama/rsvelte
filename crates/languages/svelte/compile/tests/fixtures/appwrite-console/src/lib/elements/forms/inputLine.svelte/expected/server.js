import * as $ from 'svelte/internal/server';
import { Icon, Layout } from '@appwrite.io/pink-svelte';
import InputPoint from './inputPoint.svelte';
import Button from './button.svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';

export default function InputLine($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			values,
			nullable = false,
			minDeletableIndex = 2,
			allowLineDelete,
			onAddPoint,
			onDeletePoint,
			onChangePoint,
			addLineButton,
			disabled
		} = $$props;

		function isDeleteDisabled(index) {
			let disable = index < minDeletableIndex;

			if (allowLineDelete !== undefined) {
				disable = disable && allowLineDelete;
			}

			return disable;
		}

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				alignItems: 'flex-start',
				gap: 'xs',
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(values);

								for (let index = 0, $$length = each_array.length; index < $$length; index++) {
									let value = each_array[index];

									InputPoint($$renderer, {
										disabled,
										nullable,
										values: value,
										deletePoints: true,
										disableDelete: isDeleteDisabled(index),
										onDeletePoint: () => onDeletePoint(index),
										onChangePoint: (coordIndex, newValue) => onChangePoint?.(index, coordIndex, newValue)
									});
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

					$$renderer.push(` `);

					if (values) {
						$$renderer.push('<!--[0-->');

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: 'row',
								gap: 's',
								alignItems: 'center',
								children: ($$renderer) => {
									Button($$renderer, {
										size: 'xs',
										compact: true,
										disabled: nullable || disabled,
										children: ($$renderer) => {
											Icon($$renderer, { icon: IconPlus, size: 's' });
											$$renderer.push(`<!----> Add coordinate`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);
									addLineButton?.($$renderer);
									$$renderer.push(`<!---->`);
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