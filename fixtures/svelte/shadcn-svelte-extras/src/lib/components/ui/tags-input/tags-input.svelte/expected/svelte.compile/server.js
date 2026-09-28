import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import TagsInputTag from './tags-input-tag.svelte';
import TagsInputSuggestion from './tags-input-suggestion.svelte';
import { untrack } from 'svelte';

export default function Tags_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const // disallow empties
		// disallow duplicates
		listboxId = $.props_id($$renderer);

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

		let {
			value = [],
			placeholder,
			class: className,
			disabled = false,
			validate = defaultValidate,
			onValueChange,
			suggestions,
			filterSuggestions = defaultFilter,
			restrictToSuggestions = false,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let inputValue = '';
		let tagIndex = void 0;
		let invalid = false;
		let isComposing = false;
		let inputFocused = false;
		let suggestionIndex = void 0;
		let listboxEl = void 0;

		const filteredSuggestions = $.derived(() => {
			if (!suggestions) return [];

			const available = suggestions.filter((s) => !value.includes(s));

			if (inputValue.length === 0) return available;

			return filterSuggestions(inputValue, available);
		});

		const showSuggestions = $.derived(() => inputFocused && filteredSuggestions().length > 0 && tagIndex === undefined);

		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		// default to first suggestion for better ux
		// whenever input value changes reset invalid
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		const selectSuggestion = (val) => {
			const validated = validate(val, value);

			if (!validated) return;

			value = [...value, validated];
			onValueChange?.(value);
			inputValue = '';
			suggestionIndex = undefined;
		};

		const enter = () => {
			if (isComposing) return;

			if (showSuggestions() && suggestionIndex !== undefined) {
				selectSuggestion(filteredSuggestions()[suggestionIndex]);

				return;
			}

			if (restrictToSuggestions && suggestions) {
				const match = suggestions.find((s) => s.toLowerCase() === inputValue.trim().toLowerCase());

				if (!match) {
					invalid = true;

					return;
				}

				selectSuggestion(match);

				return;
			}

			const validated = validate(inputValue, value);

			if (!validated) {
				invalid = true;

				return;
			}

			value = [...value, validated];
			onValueChange?.(value);
			inputValue = '';
		};

		const compositionStart = () => {
			isComposing = true;
		};

		const compositionEnd = () => {
			isComposing = false;
		};

		const keydown = (e) => {
			const target = e.target;

			if (e.key === 'Escape') {
				if (showSuggestions()) {
					suggestionIndex = undefined;
					inputFocused = false;
					target.blur();

					return;
				}
			}

			if (showSuggestions()) {
				if (e.key === 'ArrowDown') {
					e.preventDefault();

					if (suggestionIndex === undefined) {
						suggestionIndex = 0;
					} else {
						suggestionIndex = (suggestionIndex + 1) % filteredSuggestions().length;
					}

					return;
				}

				if (e.key === 'ArrowUp') {
					e.preventDefault();

					if (suggestionIndex === undefined) {
						suggestionIndex = filteredSuggestions().length - 1;
					} else {
						suggestionIndex = (suggestionIndex - 1 + filteredSuggestions().length) % filteredSuggestions().length;
					}

					return;
				}
			}

			if (e.key === 'Enter') {
				// prevent form submit
				e.preventDefault();

				if (isComposing) return;

				// delete focused tag
				if (tagIndex !== undefined) {
					deleteIndex(tagIndex);

					// focus previous tag or reset
					const prev = tagIndex - 1;

					tagIndex = prev < 0 ? undefined : prev;

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

					if (tagIndex !== undefined) {
						deleteIndex(tagIndex);

						// focus previous
						const prev = tagIndex - 1;

						if (prev < 0) {
							tagIndex = undefined;
						} else {
							tagIndex = prev;
						}
					} else {
						tagIndex = value.length - 1;
					}

					shouldResetIndex = false;
				}
			}

			if (e.key === 'Delete') {
				if (isAtBeginning) {
					if (inputValue.length === 0) {
						if (tagIndex !== undefined) {
							e.preventDefault();
							deleteIndex(tagIndex);

							// stay focused on the same index unless value.length === 0
							if (value.length === 0) tagIndex = undefined;

							shouldResetIndex = false;
						}
					}
				}
			}

			// controls for tag selection
			if (isAtBeginning) {
				// left
				if (e.key === 'ArrowLeft') {
					if (tagIndex !== undefined) {
						const prev = tagIndex - 1;

						if (prev < 0) {
							tagIndex = 0;
						} else {
							tagIndex = prev;
						}
					} else {
						// set initial index
						tagIndex = value.length - 1;
					}

					shouldResetIndex = false;
				}

				// right
				// we can only move right if the value is empty
				if (inputValue.length === 0) {
					if (e.key === 'ArrowRight') {
						if (tagIndex !== undefined) {
							const next = tagIndex + 1;

							if (next > value.length - 1) {
								tagIndex = undefined;
							} else {
								tagIndex = next;
							}

							shouldResetIndex = false;
						}
					}
				}
			}

			// reset the tag index to undefined
			if (shouldResetIndex) {
				tagIndex = undefined;
			}
		};

		const deleteValue = (val) => {
			const index = value.findIndex((v) => val === v);

			if (index === -1) return;

			deleteIndex(index);
		};

		const deleteIndex = (index) => {
			value = [...value.slice(0, index), ...value.slice(index + 1)];
			onValueChange?.(value);
		};

		const blur = () => {
			tagIndex = undefined;

			setTimeout(
				() => {
					inputFocused = false;
				},
				150
			);
		};

		const focus = () => {
			inputFocused = true;
		};

		$$renderer.push(`<div${$.attr_class($.clsx(cn('border-input bg-background selection:bg-primary dark:bg-input/30 relative flex min-h-[36px] w-full flex-wrap place-items-center gap-1 rounded-md border py-0.5 pr-1 pl-1 disabled:opacity-50 aria-disabled:cursor-not-allowed', className)))}${$.attr('aria-disabled', disabled)}><!--[-->`);

		const each_array = $.ensure_array_like(value);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let tag = each_array[i];

			TagsInputTag($$renderer, {
				value: tag,
				disabled,
				onDelete: deleteValue,
				active: i === tagIndex
			});
		}

		$$renderer.push(`<!--]--> <input${$.attributes(
			{
				...rest,
				value: inputValue,
				disabled,
				placeholder,
				'data-invalid': invalid,
				role: suggestions ? 'combobox' : undefined,
				'aria-expanded': suggestions ? showSuggestions() : undefined,
				'aria-autocomplete': suggestions ? 'list' : undefined,
				'aria-controls': suggestions ? listboxId : undefined,
				'aria-activedescendant': suggestionIndex !== undefined ? `${listboxId}-${suggestionIndex}` : undefined,
				class: 'placeholder:text-muted-foreground min-w-16 shrink grow basis-0 border-none bg-transparent px-2 outline-hidden focus:outline-hidden disabled:cursor-not-allowed data-[invalid=true]:text-red-500 md:text-sm'
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> `);

		if (showSuggestions()) {
			$$renderer.push(`<!--[0--><div${$.attr('id', listboxId)} role="listbox" class="bg-popover text-popover-foreground absolute top-full right-0 left-0 z-50 mt-1 max-h-50 overflow-y-auto rounded-md border p-1 shadow-md"><!--[-->`);

			const each_array_1 = $.ensure_array_like(filteredSuggestions());

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let suggestion = each_array_1[i];

				TagsInputSuggestion($$renderer, {
					id: `${listboxId}-${$.stringify(i)}`,
					value: suggestion,
					active: i === suggestionIndex,
					onSelect: selectSuggestion
				});
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}