import * as $ from 'svelte/internal/server';
import { Input } from '@appwrite.io/pink-svelte';
import { Layout, Icon } from '@appwrite.io/pink-svelte';
import Button from './button.svelte';
import { IconX } from '@appwrite.io/pink-icons-svelte';

export default function InputPoint($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const nullableSkeletonShape = [0, 0];

		let {
			values,
			nullable = false,
			deletePoints = false,
			disableDelete = false,
			onDeletePoint,
			onChangePoint,
			disabled
		} = $$props;

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							gap: 'm',
							children: ($$renderer) => {
								if (nullable) {
									$$renderer.push(`<!--[0--><!--[-->`);

									const each_array = $.ensure_array_like(nullableSkeletonShape);

									for (let index = 0, $$length = each_array.length; index < $$length; index++) {
										let _ = each_array[index];

										if (Input.Number) {
											$$renderer.push('<!--[-->');
											Input.Number($$renderer, { id: `default-${index}`, placeholder: '0', disabled: true });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push(`<!--[-1--><!--[-->`);

									const each_array_1 = $.ensure_array_like(values);

									for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
										let _ = each_array_1[index];

										if (Input.Number) {
											$$renderer.push('<!--[-->');

											Input.Number($$renderer, {
												id: `point-${index}`,
												placeholder: 'Enter value',
												step: 0.0001,
												value: values[index],
												disabled
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								}

								$$renderer.push(`<!--]--> `);

								if (deletePoints) {
									$$renderer.push('<!--[0-->');

									Button($$renderer, {
										size: 's',
										secondary: true,
										disabled: nullable || disableDelete || disabled,
										children: ($$renderer) => {
											Icon($$renderer, { icon: IconX, size: 's' });
										},
										$$slots: { default: true }
									});
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