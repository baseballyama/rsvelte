import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'errors'
]);

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<ul class="ml-4 flex list-disc flex-col gap-1"></ul>`);
var root_2 = $.from_html(`<div><!></div>`);

export default function Field_error($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const hasContent = $.derived(() => {
		// has slotted error
		if ($$props.children) return true;

		// no errors
		if (!$$props.errors || $$props.errors.length === 0) return false;

		// has an error but no message
		if ($$props.errors.length === 1 && !$$props.errors[0]?.message) {
			return false;
		}

		return true;
	});

	const isMultipleErrors = $.derived(() => $$props.errors && $$props.errors.length > 1);
	const singleErrorMessage = $.derived(() => $$props.errors && $$props.errors.length === 1 && $$props.errors[0]?.message);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			var div = root_2();

			$.attribute_effect(
				div,
				($0) => ({
					role: 'alert',
					'data-slot': 'field-error',
					class: $0,
					...restProps
				}),
				[() => cn("cn-field-error font-normal", $$props.class)]
			);

			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.children);
					$.append($$anchor, fragment_1);
				};

				var consequent_1 = ($$anchor) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(singleErrorMessage)));
					$.append($$anchor, text);
				};

				var consequent_3 = ($$anchor) => {
					var ul = root_1();

					$.each(ul, 21, () => $$props.errors ?? [], $.index, ($$anchor, error) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						{
							var consequent_2 = ($$anchor) => {
								var li = root();
								var text_1 = $.only_child(li, true);

								$.template_effect(() => $.set_text(text_1, $.get(error).message));
								$.append($$anchor, li);
							};

							$.if(node_3, ($$render) => {
								if ($.get(error)?.message) $$render(consequent_2);
							});
						}

						$.append($$anchor, fragment_3);
					});

					$.reset(ul);
					$.append($$anchor, ul);
				};

				$.if(node_1, ($$render) => {
					if ($$props.children) $$render(consequent); else if ($.get(singleErrorMessage)) $$render(consequent_1, 1); else if ($.get(isMultipleErrors)) $$render(consequent_3, 2);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => ref($$value), () => ref());
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(hasContent)) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}