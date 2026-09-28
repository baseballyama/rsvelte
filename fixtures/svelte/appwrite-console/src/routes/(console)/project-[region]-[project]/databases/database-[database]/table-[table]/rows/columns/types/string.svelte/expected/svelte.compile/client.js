import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layout, Link } from '@appwrite.io/pink-svelte';
import { IconText } from '@appwrite.io/pink-icons-svelte';
import { InputText, InputTextarea } from '$lib/elements/forms';
import { isSpatialType } from '../../store';

export default function String_1($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		array = $.prop($$props, 'array', 3, false),
		limited = $.prop($$props, 'limited', 3, false);

	const autofocus = $.derived(limited);

	const maxlength = $.derived(() => limited()
		? undefined
		: $$props.column.type === 'string' || $$props.column.type === 'varchar' ? $$props.column.size : undefined);

	const nullable = $.derived(() => !limited() ? !$$props.column.required : false);
	const columnSize = $.derived(() => 'size' in $$props.column ? $$props.column.size : 0);
	let stringValue = $.state('');

	function parseValue(str) {
		const trimmed = str?.trim() ?? null;

		if (!trimmed) return null;

		switch ($$props.column.type) {
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

	$.user_effect(() => {
		if (isSpatialType($$props.column) && Array.isArray(value())) {
			$.set(stringValue, JSON.stringify(value()), true);
		} else if (array() && Array.isArray(value())) {
			$.set(stringValue, value().map(String).join(', '), true);
		} else if (value() !== null && value() !== undefined) {
			$.set(stringValue, String(value()), true);
		} else {
			$.set(stringValue, '');
		}
	});

	$.user_effect(() => {
		if (array()) {
			const newArray = $.get(stringValue).split(',').map((item) => parseValue(item)).filter((item) => item !== null);

			if (JSON.stringify(newArray) !== JSON.stringify(value())) {
				value(newArray);
			}
		} else {
			let parsedValue = parseValue($.get(stringValue));

			if (isSpatialType($$props.column)) {
				if (!$.get(stringValue)?.trim()) {
					parsedValue = null;
				} else {
					try {
						parsedValue = JSON.parse($.get(stringValue));
					} catch {
						return;
					}
				}
			}

			if (JSON.stringify(parsedValue) !== JSON.stringify(value())) {
				value(parsedValue);
			}
		}
	});

	const getPlaceholder = () => {
		if (!array()) {
			switch ($$props.column.type) {
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
			switch ($$props.column.type) {
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			{
				let $0 = $.derived(getPlaceholder);
				let $1 = $.derived(() => !limited() ? IconText : undefined);

				InputTextarea($$anchor, {
					get id() {
						return $$props.id;
					},

					get label() {
						return $$props.label;
					},

					get nullable() {
						return $.get(nullable);
					},

					get maxlength() {
						return $.get(maxlength);
					},

					get autofocus() {
						return $.get(autofocus);
					},

					get required() {
						return $$props.column.required;
					},

					get placeholder() {
						return $.get($0);
					},

					get leadingIcon() {
						return $.get($1);
					},

					get value() {
						return $.get(stringValue);
					},

					set value($$value) {
						$.set(stringValue, $$value, true);
					},

					$$slots: {
						end: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_1 = $.first_child(fragment_2);

							$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									direction: 'column',
									alignItems: 'flex-start',
									slot: 'end',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_2 = $.first_child(fragment_3);

										{
											var consequent = ($$anchor) => {
												var fragment_4 = $.comment();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Link.Button, ($$anchor, Link_Button) => {
													Link_Button($$anchor, {
														size: 's',
														variant: 'quiet',
														$$events: {
															click: function ($$arg) {
																$.bubble_event.call(this, $$props, $$arg);
															}
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Advanced edit');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											};

											var d = $.derived(() => array() || isSpatialType($$props.column));

											$.if(node_2, ($$render) => {
												if ($.get(d)) $$render(consequent);
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						}
					}
				});
			}
		};

		var d_1 = $.derived(() => $.get(columnSize) >= 50 || array() || isSpatialType($$props.column));

		var alternate = ($$anchor) => {
			{
				let $0 = $.derived(() => !limited() ? IconText : undefined);

				InputText($$anchor, {
					get id() {
						return $$props.id;
					},

					get label() {
						return $$props.label;
					},

					get nullable() {
						return $.get(nullable);
					},

					get autofocus() {
						return $.get(autofocus);
					},

					get maxlength() {
						return $.get(maxlength);
					},
					placeholder: 'Enter string',
					get required() {
						return $$props.column.required;
					},

					get leadingIcon() {
						return $.get($0);
					},

					get value() {
						return $.get(stringValue);
					},

					set value($$value) {
						$.set(stringValue, $$value, true);
					}
				});
			}
		};

		$.if(node, ($$render) => {
			if ($.get(d_1)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}