import * as $ from 'svelte/internal/server';
import './ContentEditable.css';
import { onMount } from 'svelte';
import { getEditor } from './composerContext.js';

export default function ContentEditable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		//export let className: string;  // @lexical/image plugin seems to depend on the harded class name.
		//export let readOnly: boolean; // it is defined in lexical code but not used
		let {
			ariaActiveDescendantID = undefined,
			ariaAutoComplete = null,
			ariaControls = undefined,
			ariaDescribedBy = undefined,
			ariaExpanded = undefined,
			ariaLabel = undefined,
			ariaLabelledBy = undefined,
			ariaMultiline = undefined,
			ariaOwns = undefined,
			ariaRequired = undefined,
			autoCapitalize = undefined,
			className = 'ContentEditable__root',
			id = undefined,
			role = 'textbox',
			spellCheck = true,
			style = undefined,
			tabIndex = undefined,
			testid = undefined
		} = $$props;

		let isEditable = false;
		const editor = getEditor();
		let ref = null;

		onMount(() => {
			// defaultView is required for a root element.
			// In multi-window setups, the defaultView may not exist at certain points.
			if (ref && ref.ownerDocument && ref.ownerDocument.defaultView) {
				editor.setRootElement(ref);
			} else {
				editor.setRootElement(null);
			}

			isEditable = editor.isEditable();

			return editor.registerEditableListener((currentIsEditable) => {
				isEditable = currentIsEditable;
			});
		});

		$$renderer.push(`<div${$.attr('aria-activedescendant', !isEditable ? undefined : ariaActiveDescendantID)}${$.attr('aria-autocomplete', !isEditable ? 'none' : ariaAutoComplete)}${$.attr('aria-controls', !isEditable ? undefined : ariaControls)}${$.attr('aria-describedby', ariaDescribedBy)}${$.attr('aria-expanded', !isEditable
			? undefined
			: role === 'combobox' ? !!ariaExpanded : undefined)}${$.attr('aria-label', ariaLabel)}${$.attr('aria-labelledby', ariaLabelledBy)}${$.attr('aria-multiline', ariaMultiline)}${$.attr('aria-owns', !isEditable ? null : ariaOwns)}${$.attr('aria-readonly', !isEditable ? true : undefined)}${$.attr('aria-required', ariaRequired)}${$.attr('autocapitalize', autoCapitalize)}${$.attr_class($.clsx(className))}${$.attr('contenteditable', isEditable)}${$.attr('data-testid', testid)}${$.attr('id', id)}${$.attr('role', role)}${$.attr('spellcheck', spellCheck)}${$.attr_style(style)}${$.attr('tabindex', tabIndex)}></div>`);
	});
}