import * as $ from 'svelte/internal/server';
import { Layout, Link } from '@appwrite.io/pink-svelte';
import { IconText } from '@appwrite.io/pink-icons-svelte';
import { InputText, InputTextarea } from '$lib/elements/forms';
import { isSpatialType } from '../../store';

export default function String_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id,
			label,
			value = void 0,
			array = false,
			limited = false,
			column
		} = $$props;

		const autofocus = $.derived(() => limited);

		const maxlength = $.derived(() => limited
			? undefined
			: column.type === 'string' || column.type === 'varchar' ? column.size : undefined);

		const nullable = $.derived(() => !limited ? !column.required : false);
		const columnSize = $.derived(() => 'size' in column ? column.size : 0);
		let stringValue = '';

		function parseValue(str) {
			const trimmed = str?.trim() ?? null;

			if (!trimmed) return null;

			switch (column.type) {
				case 'bigint':

				case 'integer':
					{
						const int = parseInt(trimmed, 10);

						return isNaN(int) ? null : int;
					}

				case 'double':
					{
						const float = parseFloat(trimmed);

						return isNaN(float) ? null : float;
					}

				case 'boolean':
					{
						const lower = trimmed.toLowerCase();

						if (lower === 'true' || lower === '1') return true;
						if (lower === 'false' || lower === '0') return false;

						return null;
					}

				case 'point':

				case 'linestring':

				case 'polygon':
					return trimmed;

				case 'string':

				default:
					return trimmed;
			}
		}

		const getPlaceholder = () => {
			if (!array) {
				switch (column.type) {
					case 'bigint':

					case 'integer':
						return 'Enter integer';

					case 'double':
						return 'Enter number';

					case 'boolean':
						return 'Enter true or false';

					case 'string':

					default:
						return 'Enter string';
				}
			} else {
				switch (column.type) {
					case 'bigint':

					case 'integer':
						return 'Enter integers separated by commas';

					case 'double':
						return 'Enter numbers separated by commas';

					case 'boolean':
						return 'Enter true/false separated by commas';

					case 'string':

					default:
						return 'Enter strings separated by commas';
				}
			}
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (columnSize() >= 50 || array || isSpatialType(column)) {
				$$renderer.push('<!--[0-->');

				InputTextarea($$renderer, {
					id,
					label,
					nullable: nullable(),
					maxlength: maxlength(),
					autofocus: autofocus(),
					required: column.required,
					placeholder: getPlaceholder(),
					leadingIcon: !limited ? IconText : undefined,
					get value() {
						return stringValue;
					},

					set value($$value) {
						stringValue = $$value;
						$$settled = false;
					},

					$$slots: {
						end: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'column',
									alignItems: 'flex-start',
									slot: 'end',
									children: ($$renderer) => {
										if (array || isSpatialType(column)) {
											$$renderer.push('<!--[0-->');

											if (Link.Button) {
												$$renderer.push('<!--[-->');

												Link.Button($$renderer, {
													size: 's',
													variant: 'quiet',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Advanced edit`);
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
						}
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');

				InputText($$renderer, {
					id,
					label,
					nullable: nullable(),
					autofocus: autofocus(),
					maxlength: maxlength(),
					placeholder: 'Enter string',
					required: column.required,
					leadingIcon: !limited ? IconText : undefined,
					get value() {
						return stringValue;
					},

					set value($$value) {
						stringValue = $$value;
						$$settled = false;
					}
				});
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}