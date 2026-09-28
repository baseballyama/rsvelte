import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ToastGroupContext } from '../modules/group-context.js';
import { mergeProps, normalizeProps, useMachine } from '@zag-js/svelte';
import { group } from '@zag-js/toast';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div></div>`);

export default function Group($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	const element = $.derived(() => $$props.element),
		children = $.derived(() => $$props.children),
		toaster = $.derived(() => $$props.toaster),
		rest = $.derived(() => $.exclude_from_object(props, ['element', 'children', 'toaster']));

	const service = useMachine(group.machine, () => ({ id, store: $.get(toaster) }));
	const api = $.derived(() => group.connect(service, normalizeProps));
	const attributes = $.derived(() => mergeProps($.get(api).getGroupProps(), $.get(rest)));

	ToastGroupContext.provide(() => service);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $.get(element), () => $.get(attributes));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(attributes) }));

			$.each(div, 23, () => $.get(api).getToasts(), (toast) => toast.id, ($$anchor, toast, index) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => ({ ...$.get(toast), index: $.get(index) }));

					$.snippet(node_2, () => $.get(children) ?? $.noop, () => $.get($0));
				}

				$.append($$anchor, fragment_2);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}