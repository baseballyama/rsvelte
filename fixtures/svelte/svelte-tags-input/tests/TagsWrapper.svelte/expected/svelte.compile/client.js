import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tags from '../src/Tags.svelte';

export default function TagsWrapper($$anchor, $$props) {
	$.push($$props, true);

	let tags = $.prop($$props, 'tags', 31, () => $.proxy([])),
		placeholder = $.prop($$props, 'placeholder', 3, ''),
		maxTags = $.prop($$props, 'maxTags', 3, false),
		allowPaste = $.prop($$props, 'allowPaste', 3, false),
		allowDrop = $.prop($$props, 'allowDrop', 3, false),
		onlyUnique = $.prop($$props, 'onlyUnique', 3, false),
		disable = $.prop($$props, 'disable', 3, false),
		readonly = $.prop($$props, 'readonly', 3, false),
		autoComplete = $.prop($$props, 'autoComplete', 3, false),
		autoCompleteStartFocused = $.prop($$props, 'autoCompleteStartFocused', 3, false),
		onlyAutocomplete = $.prop($$props, 'onlyAutocomplete', 3, false),
		minChars = $.prop($$props, 'minChars', 3, 1),
		customValidation = $.prop($$props, 'customValidation', 3, null),
		onTagAdded = $.prop($$props, 'onTagAdded', 3, () => {}),
		onTagRemoved = $.prop($$props, 'onTagRemoved', 3, () => {}),
		onTagClick = $.prop($$props, 'onTagClick', 3, () => {});

	Tags($$anchor, {
		get placeholder() {
			return placeholder();
		},

		get maxTags() {
			return maxTags();
		},

		get allowPaste() {
			return allowPaste();
		},

		get allowDrop() {
			return allowDrop();
		},

		get onlyUnique() {
			return onlyUnique();
		},

		get disable() {
			return disable();
		},

		get readonly() {
			return readonly();
		},

		get autoComplete() {
			return autoComplete();
		},

		get autoCompleteStartFocused() {
			return autoCompleteStartFocused();
		},

		get onlyAutocomplete() {
			return onlyAutocomplete();
		},

		get minChars() {
			return minChars();
		},

		get customValidation() {
			return customValidation();
		},

		get onTagAdded() {
			return onTagAdded();
		},

		get onTagRemoved() {
			return onTagRemoved();
		},

		get onTagClick() {
			return onTagClick();
		},

		get tags() {
			return tags();
		},

		set tags($$value) {
			tags($$value);
		}
	});

	$.pop();
}