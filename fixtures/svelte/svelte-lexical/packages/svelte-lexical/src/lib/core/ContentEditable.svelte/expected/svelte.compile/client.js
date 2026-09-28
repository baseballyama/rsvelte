import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import './ContentEditable.css';
import { onMount } from 'svelte';
import { getEditor } from './composerContext.js';

var root = $.from_html(`<div></div>`);

export default function ContentEditable($$anchor, $$props) {
	$.push($$props, true);

	//export let className: string;  // @lexical/image plugin seems to depend on the harded class name.
	//export let readOnly: boolean; // it is defined in lexical code but not used
	let ariaActiveDescendantID = $.prop($$props, 'ariaActiveDescendantID', 3, undefined),
		ariaAutoComplete = $.prop($$props, 'ariaAutoComplete', 3, null),
		ariaControls = $.prop($$props, 'ariaControls', 3, undefined),
		ariaDescribedBy = $.prop($$props, 'ariaDescribedBy', 3, undefined),
		ariaExpanded = $.prop($$props, 'ariaExpanded', 3, undefined),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, undefined),
		ariaLabelledBy = $.prop($$props, 'ariaLabelledBy', 3, undefined),
		ariaMultiline = $.prop($$props, 'ariaMultiline', 3, undefined),
		ariaOwns = $.prop($$props, 'ariaOwns', 3, undefined),
		ariaRequired = $.prop($$props, 'ariaRequired', 3, undefined),
		autoCapitalize = $.prop($$props, 'autoCapitalize', 3, undefined),
		className = $.prop($$props, 'className', 3, 'ContentEditable__root'),
		id = $.prop($$props, 'id', 3, undefined),
		role = $.prop($$props, 'role', 3, 'textbox'),
		spellCheck = $.prop($$props, 'spellCheck', 3, true),
		style = $.prop($$props, 'style', 3, undefined),
		tabIndex = $.prop($$props, 'tabIndex', 3, undefined),
		testid = $.prop($$props, 'testid', 3, undefined);

	let isEditable = $.state(false);
	const editor = getEditor();
	let ref = $.state(null);

	onMount(() => {
		// defaultView is required for a root element.
		// In multi-window setups, the defaultView may not exist at certain points.
		if ($.get(ref) && $.get(ref).ownerDocument && $.get(ref).ownerDocument.defaultView) {
			editor.setRootElement($.get(ref));
		} else {
			editor.setRootElement(null);
		}

		$.set(isEditable, editor.isEditable(), true);

		return editor.registerEditableListener((currentIsEditable) => {
			$.set(isEditable, currentIsEditable, true);
		});
	});

	var div = root();

	$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));

	$.template_effect(() => {
		$.set_attribute(div, 'aria-activedescendant', !$.get(isEditable) ? undefined : ariaActiveDescendantID());
		$.set_attribute(div, 'aria-autocomplete', !$.get(isEditable) ? 'none' : ariaAutoComplete());
		$.set_attribute(div, 'aria-controls', !$.get(isEditable) ? undefined : ariaControls());
		$.set_attribute(div, 'aria-describedby', ariaDescribedBy());

		$.set_attribute(div, 'aria-expanded', !$.get(isEditable)
			? undefined
			: role() === 'combobox' ? !!ariaExpanded() : undefined);

		$.set_attribute(div, 'aria-label', ariaLabel());
		$.set_attribute(div, 'aria-labelledby', ariaLabelledBy());
		$.set_attribute(div, 'aria-multiline', ariaMultiline());
		$.set_attribute(div, 'aria-owns', !$.get(isEditable) ? null : ariaOwns());
		$.set_attribute(div, 'aria-readonly', !$.get(isEditable) ? true : undefined);
		$.set_attribute(div, 'aria-required', ariaRequired());
		$.set_attribute(div, 'autocapitalize', autoCapitalize());
		$.set_class(div, 1, $.clsx(className()));
		$.set_attribute(div, 'contenteditable', $.get(isEditable));
		$.set_attribute(div, 'data-testid', testid());
		$.set_attribute(div, 'id', id());
		$.set_attribute(div, 'role', role());
		$.set_attribute(div, 'spellcheck', spellCheck());
		$.set_style(div, style());
		$.set_attribute(div, 'tabindex', tabIndex());
	});

	$.append($$anchor, div);
	$.pop();
}