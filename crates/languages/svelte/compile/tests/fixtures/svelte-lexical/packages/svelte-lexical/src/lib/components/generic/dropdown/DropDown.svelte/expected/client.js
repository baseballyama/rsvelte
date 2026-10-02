import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CAN_USE_DOM } from '@lexical/utils';
import DropDownItems from './DropDownItems.svelte';
import Portal from '../portal/Portal.svelte';
import { isDOMNode } from 'lexical';

var root = $.from_html(`<span></span>`);
var root_1 = $.from_html(`<span class="text dropdown-button-text"> </span>`);
var root_2 = $.from_html(`<button type="button"><!> <!> <i class="chevron-down"></i></button> <!>`, 1);

export default function DropDown($$anchor, $$props) {
	$.push($$props, true);

	let disabled = $.prop($$props, 'disabled', 3, false),
		buttonAriaLabel = $.prop($$props, 'buttonAriaLabel', 3, undefined),
		buttonIconClassName = $.prop($$props, 'buttonIconClassName', 3, undefined),
		buttonLabel = $.prop($$props, 'buttonLabel', 3, undefined),
		stopCloseOnClickSelf = $.prop($$props, 'stopCloseOnClickSelf', 3, false),
		title = $.prop($$props, 'title', 3, undefined),
		target = $.prop($$props, 'target', 3, undefined);

	let dropDownRef = $.state(void 0);
	let buttonRef = $.state(void 0);
	let showDropDown = $.state(false);

	function handleClose() {
		$.set(showDropDown, false);

		if ($.get(buttonRef)) {
			$.get(buttonRef).focus();
		}
	}

	$.user_effect(() => {
		if (!CAN_USE_DOM) return;
		if (!$.get(showDropDown)) return;
		if (!$.get(buttonRef) || !$.get(dropDownRef)) return;

		const { top, left } = $.get(buttonRef).getBoundingClientRect();

		$.get(dropDownRef).style.top = `${top + 42}px`;
		$.get(dropDownRef).style.left = `${Math.min(left, window.innerWidth - $.get(dropDownRef).offsetWidth - 20)}px`;
	});

	const handle = (event) => {
		const target = event.target;

		if (!isDOMNode(target)) {
			return;
		}

		if (stopCloseOnClickSelf()) {
			if ($.get(dropDownRef) && $.get(dropDownRef).contains(target)) return;
		}

		if ($.get(buttonRef) && !$.get(buttonRef).contains(target)) {
			$.set(showDropDown, false);
		}
	};

	$.user_effect(() => {
		if (!CAN_USE_DOM) return;
		if (!$.get(showDropDown)) return;

		document.addEventListener('click', handle);

		return () => document.removeEventListener('click', handle);
	});

	var fragment = root_2();
	var button = $.first_child(fragment);
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.template_effect(() => $.set_class(span, 1, $.clsx(buttonIconClassName())));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (buttonIconClassName()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var span_1 = root_1();
			var text = $.only_child(span_1, true);

			$.template_effect(() => $.set_text(text, buttonLabel()));
			$.append($$anchor, span_1);
		};

		$.if(node_1, ($$render) => {
			if (buttonLabel()) $$render(consequent_1);
		});
	}

	$.next(2);
	$.reset(button);
	$.bind_this(button, ($$value) => $.set(buttonRef, $$value), () => $.get(buttonRef));

	var node_2 = $.sibling(button, 2);

	{
		var consequent_2 = ($$anchor) => {
			Portal($$anchor, {
				get target() {
					return target();
				},

				children: ($$anchor, $$slotProps) => {
					DropDownItems($$anchor, {
						onClose: handleClose,
						get dropDownRef() {
							return $.get(dropDownRef);
						},

						set dropDownRef($$value) {
							$.set(dropDownRef, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.snippet(node_3, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		$.if(node_2, ($$render) => {
			if ($.get(showDropDown)) $$render(consequent_2);
		});
	}

	$.template_effect(() => {
		button.disabled = disabled();
		$.set_attribute(button, 'aria-label', buttonAriaLabel() || buttonLabel());
		$.set_class(button, 1, $.clsx($$props.buttonClassName));
		$.set_attribute(button, 'title', title());
	});

	$.delegated('click', button, () => $.set(showDropDown, !$.get(showDropDown)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);