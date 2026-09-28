import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { box } from 'svelte-toolbelt';
import { useRenameInput } from './rename.svelte.js';

var root = $.from_html(`<textarea></textarea>`);
var root_1 = $.from_html(`<input/>`);

export default function Rename($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 3, uid),
		inputTag = $.prop($$props, 'inputTag', 3, 'input'),
		mode = $.prop($$props, 'mode', 15, 'view'),
		value = $.prop($$props, 'value', 15),
		fallbackSelectionBehavior = $.prop($$props, 'fallbackSelectionBehavior', 3, 'end'),
		onSave = $.prop($$props, 'onSave', 3, () => {}),
		onCancel = $.prop($$props, 'onCancel', 3, () => {}),
		validate = $.prop($$props, 'validate', 3, () => true);

	let inputRef = $.state(null);
	let textRef = $.state(null);

	const rootState = useRenameInput({
		id: id(),
		mode: box.with(() => mode(), (v) => mode(v)),
		value: box.with(() => value(), (v) => value(v)),
		inputRef: box.with(() => $.get(inputRef), (v) => $.set(inputRef, v, true)),
		textRef: box.with(() => $.get(textRef), (v) => $.set(textRef, v, true)),
		onSave: onSave(),
		onCancel: onCancel(),
		blurBehavior: box.with(() => $$props.blurBehavior),
		validate: validate(),
		fallbackSelectionBehavior: box.with(() => fallbackSelectionBehavior())
	});

	const commonClass = cn('text-base min-w-0 w-full');

	const inputProps = $.derived(() => ({
		'data-mode': 'edit',
		id: id(),
		class: cn(commonClass, 'border-border rounded-md border outline-none', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', $$props.class, $$props.inputClass),
		'aria-invalid': rootState.invalid,
		onkeydown: rootState.onInputKeydown,
		onblur: rootState.onInputBlur
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var textarea = root();

					$.remove_textarea_child(textarea);
					$.attribute_effect(textarea, () => ({ ...$.get(inputProps) }));
					$.bind_this(textarea, ($$value) => $.set(inputRef, $$value), () => $.get(inputRef));
					$.bind_value(textarea, () => rootState.editingValue, ($$value) => rootState.editingValue = $$value);
					$.append($$anchor, textarea);
				};

				var alternate = ($$anchor) => {
					var input = root_1();

					$.attribute_effect(input, () => ({ type: 'text', autocomplete: 'off', ...$.get(inputProps) }), void 0, void 0, void 0, void 0, true);
					$.bind_this(input, ($$value) => $.set(inputRef, $$value), () => $.get(inputRef));
					$.bind_value(input, () => rootState.editingValue, ($$value) => rootState.editingValue = $$value);
					$.append($$anchor, input);
				};

				$.if(node_1, ($$render) => {
					if (inputTag() === 'textarea') $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.element(node_2, () => $$props.this, false, ($$element, $$anchor) => {
				$.bind_this($$element, ($$value) => $.set(textRef, $$value, true), () => $.get(textRef));

				$.attribute_effect(
					$$element,
					($0) => ({
						id: id(),
						'data-mode': 'view',
						class: $0,
						onclick: rootState.onTextClick
					}),
					[() => cn(commonClass, $$props.class, $$props.textClass)]
				);

				var text = $.text();

				$.template_effect(() => $.set_text(text, value()));
				$.append($$anchor, text);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (mode() === 'edit') $$render(consequent_1); else if (mode() === 'view') $$render(consequent_2, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}