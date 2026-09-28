import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { commandContext } from '$lib/context';
import { shortcut } from '$lib/actions/shortcut.svelte';
import { Command } from '$lib/components/docs/command';
import { UseBoolean } from '$lib/hooks/use-boolean.svelte';
import SiteHeader from '$lib/components/site-header.svelte';

var root = $.from_html(`<!> <!> <div class="flex flex-col items-center"><div class="site-container"><!></div></div>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const commandState = commandContext.set(new UseBoolean(false));
	var fragment = root();

	$.action($.window, ($$node, $$action_arg) => shortcut?.($$node, $$action_arg), () => ({ ctrl: true, key: 'k', callback: commandState.setTrue }));

	var node = $.first_child(fragment);

	Command(node, {});

	var node_1 = $.sibling(node, 2);

	SiteHeader(node_1, {});

	var div = $.sibling(node_1, 2);
	var div_1 = $.child(div);
	var node_2 = $.child(div_1);

	$.snippet(node_2, () => $$props.children);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}