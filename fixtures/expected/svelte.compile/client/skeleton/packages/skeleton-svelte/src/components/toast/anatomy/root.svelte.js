import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LocaleProviderRootContext } from '../../locale-provider/modules/root-context.js';
import { ToastGroupContext } from '../modules/group-context.js';
import { ToastRootContext } from '../modules/root-context.js';
import { mergeProps, normalizeProps, useMachine } from '@zag-js/svelte';
import { connect, machine } from '@zag-js/toast';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div><div></div> <!> <div></div></div>`);

export default function Root($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const group = ToastGroupContext.consume();
	const locale = LocaleProviderRootContext.consume();

	const element = $.derived(() => $$props.element),
		children = $.derived(() => $$props.children),
		toastProps = $.derived(() => $$props.toast),
		rest = $.derived(() => $.exclude_from_object(props, ['element', 'children', 'toast']));

	const service = useMachine(machine, () => ({ ...$.get(toastProps), dir: locale().dir, parent: group() }));
	const toast = $.derived(() => connect(service, normalizeProps));
	const attributes = $.derived(() => mergeProps($.get(toast).getRootProps(), $.get(rest)));

	ToastRootContext.provide(() => $.get(toast));

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

			var div_1 = $.child(div);

			$.attribute_effect(div_1, ($0) => ({ ...$0 }), [() => $.get(toast).getGhostBeforeProps()]);

			var node_2 = $.sibling(div_1, 2);

			$.snippet(node_2, () => $.get(children) ?? $.noop);

			var div_2 = $.sibling(node_2, 2);

			$.attribute_effect(div_2, ($0) => ({ ...$0 }), [() => $.get(toast).getGhostAfterProps()]);
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