import * as $ from 'svelte/internal/server';
import Tags from '../src/Tags.svelte';

export default function TagsWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			tags = [],
			placeholder = '',
			maxTags = false,
			allowPaste = false,
			allowDrop = false,
			onlyUnique = false,
			disable = false,
			readonly = false,
			autoComplete = false,
			autoCompleteStartFocused = false,
			onlyAutocomplete = false,
			minChars = 1,
			customValidation = null,
			onTagAdded = () => {},
			onTagRemoved = () => {},
			onTagClick = () => {}
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Tags($$renderer, {
				placeholder,
				maxTags,
				allowPaste,
				allowDrop,
				onlyUnique,
				disable,
				readonly,
				autoComplete,
				autoCompleteStartFocused,
				onlyAutocomplete,
				minChars,
				customValidation,
				onTagAdded,
				onTagRemoved,
				onTagClick,
				get tags() {
					return tags;
				},

				set tags($$value) {
					tags = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { tags });
	});
}