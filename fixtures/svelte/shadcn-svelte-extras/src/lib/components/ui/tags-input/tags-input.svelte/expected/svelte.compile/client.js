import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import TagsInputTag from './tags-input-tag.svelte';
import TagsInputSuggestion from './tags-input-suggestion.svelte';
import { untrack } from 'svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'placeholder',
	'class',
	'disabled',
	'validate',
	'onValueChange',
	'suggestions',
	'filterSuggestions',
	'restrictToSuggestions'
]);

var root = $.from_html(`<div role="listbox" class="bg-popover text-popover-foreground absolute top-full right-0 left-0 z-50 mt-1 max-h-50 overflow-y-auto rounded-md border p-1 shadow-md"></div>`);
var root_1 = $.from_html(`<div><!> <input/> <!></div>`);

export default function Tags_input($$anchor, $$props) {
	const // disallow empties
	// disallow duplicates
	listboxId = $.props_id();

	$.push($$props, true);

	const defaultValidate = (val, tags) => {
		const transformed = val.trim();

		// disallow empties
		if (transformed.length === 0) return undefined;

		// disallow duplicates
		if (tags.find((t) => transformed === t)) return undefined;

		return transformed;
	};

	const defaultFilter = (inputValue, suggestions) => {
		const lower = inputValue.toLowerCase();

		return suggestions.filter((s) => s.toLowerCase().includes(lower));
	};

	let value = $.prop($$props, 'value', 31, () => $.proxy([])),
		disabled = $.prop($$props, 'disabled', 3, false),
		validate = $.prop($$props, 'validate', 3, defaultValidate),
		filterSuggestions = $.prop($$props, 'filterSuggestions', 3, defaultFilter),
		restrictToSuggestions = $.prop($$props, 'restrictToSuggestions', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	let inputValue = $.state('');
	let tagIndex = $.state(void 0);
	let invalid = $.state(false);
	let isComposing = $.state(false);
	let inputFocused = $.state(false);
	let suggestionIndex = $.state(void 0);
	let listboxEl = $.state(void 0);

	$.user_effect(() => {
		if ($.get(suggestionIndex) !== undefined && $.get(listboxEl)) {
			const item = $.get(listboxEl).querySelector(`#${CSS.escape(listboxId)}-${$.get(suggestionIndex)}`);

			item?.scrollIntoView({ block: 'nearest' });
		}
	});

	const filteredSuggestions = $.derived(() => {
		if (!$$props.suggestions) return [];

		const available = $$props.suggestions.filter((s) => !value().includes(s));

		if ($.get(inputValue).length === 0) return available;

		return filterSuggestions()($.get(inputValue), available);
	});

	const showSuggestions = $.derived(() => $.get(inputFocused) && $.get(filteredSuggestions).length > 0 && $.get(tagIndex) === undefined);

	$.user_effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		$.get(filteredSuggestions);

		untrack(() => {
			// default to first suggestion for better ux
			$.set(suggestionIndex, $.get(filteredSuggestions).length > 0 ? 0 : undefined, true);
		});
	});

	$.user_effect(() => {
		// whenever input value changes reset invalid
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		$.get(inputValue);

		untrack(() => {
			$.set(invalid, false);
		});
	});

	const selectSuggestion = (val) => {
		const validated = validate()(val, value());

		if (!validated) return;

		value([...value(), validated]);
		$$props.onValueChange?.(value());
		$.set(inputValue, '');
		$.set(suggestionIndex, undefined);
	};

	const enter = () => {
		if ($.get(isComposing)) return;

		if ($.get(showSuggestions) && $.get(suggestionIndex) !== undefined) {
			selectSuggestion($.get(filteredSuggestions)[$.get(suggestionIndex)]);

			return;
		}

		if (restrictToSuggestions() && $$props.suggestions) {
			const match = $$props.suggestions.find((s) => s.toLowerCase() === $.get(inputValue).trim().toLowerCase());

			if (!match) {
				$.set(invalid, true);

				return;
			}

			selectSuggestion(match);

			return;
		}

		const validated = validate()($.get(inputValue), value());

		if (!validated) {
			$.set(invalid, true);

			return;
		}

		value([...value(), validated]);
		$$props.onValueChange?.(value());
		$.set(inputValue, '');
	};

	const compositionStart = () => {
		$.set(isComposing, true);
	};

	const compositionEnd = () => {
		$.set(isComposing, false);
	};

	const keydown = (e) => {
		const target = e.target;

		if (e.key === 'Escape') {
			if ($.get(showSuggestions)) {
				$.set(suggestionIndex, undefined);
				$.set(inputFocused, false);
				target.blur();

				return;
			}
		}

		if ($.get(showSuggestions)) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();

				if ($.get(suggestionIndex) === undefined) {
					$.set(suggestionIndex, 0);
				} else {
					$.set(suggestionIndex, ($.get(suggestionIndex) + 1) % $.get(filteredSuggestions).length);
				}

				return;
			}

			if (e.key === 'ArrowUp') {
				e.preventDefault();

				if ($.get(suggestionIndex) === undefined) {
					$.set(suggestionIndex, $.get(filteredSuggestions).length - 1);
				} else {
					$.set(suggestionIndex, ($.get(suggestionIndex) - 1 + $.get(filteredSuggestions).length) % $.get(filteredSuggestions).length);
				}

				return;
			}
		}

		if (e.key === 'Enter') {
			// prevent form submit
			e.preventDefault();

			if ($.get(isComposing)) return;

			// delete focused tag
			if ($.get(tagIndex) !== undefined) {
				deleteIndex($.get(tagIndex));

				// focus previous tag or reset
				const prev = $.get(tagIndex) - 1;

				$.set(tagIndex, prev < 0 ? undefined : prev, true);

				return;
			}

			enter();

			return;
		}

		const isAtBeginning = target.selectionStart === 0 && target.selectionEnd === 0;
		let shouldResetIndex = true;

		if (e.key === 'Backspace') {
			if (isAtBeginning) {
				e.preventDefault();

				if ($.get(tagIndex) !== undefined) {
					deleteIndex($.get(tagIndex));

					// focus previous
					const prev = $.get(tagIndex) - 1;

					if (prev < 0) {
						$.set(tagIndex, undefined);
					} else {
						$.set(tagIndex, prev);
					}
				} else {
					$.set(tagIndex, value().length - 1);
				}

				shouldResetIndex = false;
			}
		}

		if (e.key === 'Delete') {
			if (isAtBeginning) {
				if ($.get(inputValue).length === 0) {
					if ($.get(tagIndex) !== undefined) {
						e.preventDefault();
						deleteIndex($.get(tagIndex));

						// stay focused on the same index unless value.length === 0
						if (value().length === 0) $.set(tagIndex, undefined);

						shouldResetIndex = false;
					}
				}
			}
		}

		// controls for tag selection
		if (isAtBeginning) {
			// left
			if (e.key === 'ArrowLeft') {
				if ($.get(tagIndex) !== undefined) {
					const prev = $.get(tagIndex) - 1;

					if (prev < 0) {
						$.set(tagIndex, 0);
					} else {
						$.set(tagIndex, prev);
					}
				} else {
					// set initial index
					$.set(tagIndex, value().length - 1);
				}

				shouldResetIndex = false;
			}

			// right
			// we can only move right if the value is empty
			if ($.get(inputValue).length === 0) {
				if (e.key === 'ArrowRight') {
					if ($.get(tagIndex) !== undefined) {
						const next = $.get(tagIndex) + 1;

						if (next > value().length - 1) {
							$.set(tagIndex, undefined);
						} else {
							$.set(tagIndex, next);
						}

						shouldResetIndex = false;
					}
				}
			}
		}

		// reset the tag index to undefined
		if (shouldResetIndex) {
			$.set(tagIndex, undefined);
		}
	};

	const deleteValue = (val) => {
		const index = value().findIndex((v) => val === v);

		if (index === -1) return;

		deleteIndex(index);
	};

	const deleteIndex = (index) => {
		value([...value().slice(0, index), ...value().slice(index + 1)]);
		$$props.onValueChange?.(value());
	};

	const blur = () => {
		$.set(tagIndex, undefined);

		setTimeout(
			() => {
				$.set(inputFocused, false);
			},
			150
		);
	};

	const focus = () => {
		$.set(inputFocused, true);
	};

	var div = root_1();
	var node = $.child(div);

	$.each(node, 18, value, (tag) => tag, ($$anchor, tag, i) => {
		{
			let $0 = $.derived(() => $.get(i) === $.get(tagIndex));

			TagsInputTag($$anchor, {
				get value() {
					return tag;
				},

				get disabled() {
					return disabled();
				},
				onDelete: deleteValue,
				get active() {
					return $.get($0);
				}
			});
		}
	});

	var input = $.sibling(node, 2);

	$.attribute_effect(
		input,
		() => ({
			...rest,
			onblur: blur,
			onfocus: focus,
			oncompositionstart: compositionStart,
			oncompositionend: compositionEnd,
			disabled: disabled(),
			placeholder: $$props.placeholder,
			'data-invalid': $.get(invalid),
			onkeydown: keydown,
			role: $$props.suggestions ? 'combobox' : undefined,
			'aria-expanded': $$props.suggestions ? $.get(showSuggestions) : undefined,
			'aria-autocomplete': $$props.suggestions ? 'list' : undefined,
			'aria-controls': $$props.suggestions ? listboxId : undefined,
			'aria-activedescendant': $.get(suggestionIndex) !== undefined ? `${listboxId}-${$.get(suggestionIndex)}` : undefined,
			class: 'placeholder:text-muted-foreground min-w-16 shrink grow basis-0 border-none bg-transparent px-2 outline-hidden focus:outline-hidden disabled:cursor-not-allowed data-[invalid=true]:text-red-500 md:text-sm'
		}),
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	var node_1 = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.each(div_1, 22, () => $.get(filteredSuggestions), (suggestion) => suggestion, ($$anchor, suggestion, i) => {
				{
					let $0 = $.derived(() => $.get(i) === $.get(suggestionIndex));

					TagsInputSuggestion($$anchor, {
						get id() {
							return `${listboxId}-${$.get(i) ?? ''}`;
						},

						get value() {
							return suggestion;
						},

						get active() {
							return $.get($0);
						},
						onSelect: selectSuggestion
					});
				}
			});

			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(listboxEl, $$value), () => $.get(listboxEl));
			$.template_effect(() => $.set_attribute(div_1, 'id', listboxId));
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(showSuggestions)) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $0);
			$.set_attribute(div, 'aria-disabled', disabled());
		},
		[
			() => $.clsx(cn('border-input bg-background selection:bg-primary dark:bg-input/30 relative flex min-h-[36px] w-full flex-wrap place-items-center gap-1 rounded-md border py-0.5 pr-1 pl-1 disabled:opacity-50 aria-disabled:cursor-not-allowed', $$props.class))
		]
	);

	$.bind_value(input, () => $.get(inputValue), ($$value) => $.set(inputValue, $$value));
	$.append($$anchor, div);
	$.pop();
}