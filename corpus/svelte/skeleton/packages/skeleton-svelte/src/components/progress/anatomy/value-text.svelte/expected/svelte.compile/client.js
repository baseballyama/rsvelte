import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ProgressRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<span><!></span>`);

export default function Value_text($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const progress = ProgressRootContext.consume();

	const element = $.derived(() => $$props.element),
		children = $.derived(() => $$props.children),
		rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

	const attributes = $.derived(() => mergeProps(progress().getValueTextProps(), $.get(rest)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $.get(element), () => $.get(attributes));
			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			var span = root();

			$.attribute_effect(span, () => ({ ...$.get(attributes) }));

			var node_2 = $.child(span);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.snippet(node_3, () => $.get(children) ?? $.noop);
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => progress().percentAsString]);
					$.append($$anchor, text);
				};

				$.if(node_2, ($$render) => {
					if ($.get(children)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}