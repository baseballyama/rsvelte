import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAllContexts, mount, unmount } from 'svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Root($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const context = getAllContexts();

	const children = $.derived(() => $$props.children),
		disabled = $.derived(() => $.fallback($$props.disabled, false)),
		target = $.derived(() => $.fallback($$props.target, () => typeof window === 'undefined' ? undefined : document.body, true));

	$.user_effect(() => {
		if ($.get(disabled) || !$.get(target)) {
			return;
		}

		const instance = mount($.get(children), { target: $.get(target), context });

		return () => unmount(instance);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $.get(children));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(disabled) || !$.get(target)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}