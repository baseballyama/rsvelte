import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SelectValueState } from "../select.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'id',
	'placeholder',
	'child',
	'children'
]);

var root = $.from_html(`<span><!></span>`);

export default function Select_value($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		restProps = $.rest_props($$props, rest_excludes);

	const valueState = SelectValueState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		placeholder: boxWith(() => $$props.placeholder)
	});

	const mergedProps = $.derived(() => mergeProps(restProps, valueState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...valueState.snippetProps }));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			var span = root();

			$.attribute_effect(span, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(span);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.snippet(node_3, () => $$props.children ?? $.noop, () => valueState.snippetProps);
					$.append($$anchor, fragment_2);
				};

				var consequent_2 = ($$anchor) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, valueState.snippetProps.selection.selected?.label ?? $$props.placeholder));
					$.append($$anchor, text);
				};

				var consequent_3 = ($$anchor) => {
					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, $0), [
						() => valueState.snippetProps.selection.selected.length > 0
							? valueState.snippetProps.selection.selected.map((selected) => selected.label).join(", ")
							: $$props.placeholder
					]);

					$.append($$anchor, text_1);
				};

				var alternate = ($$anchor) => {
					var text_2 = $.text();

					$.template_effect(() => $.set_text(text_2, $$props.placeholder));
					$.append($$anchor, text_2);
				};

				$.if(node_2, ($$render) => {
					if ($$props.children) $$render(consequent_1); else if (valueState.snippetProps.selection.type === "single") $$render(consequent_2, 1); else if (valueState.snippetProps.selection.type === "multiple" && valueState.snippetProps.selection.selected) $$render(consequent_3, 2); else $$render(alternate, -1);
				});
			}

			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}