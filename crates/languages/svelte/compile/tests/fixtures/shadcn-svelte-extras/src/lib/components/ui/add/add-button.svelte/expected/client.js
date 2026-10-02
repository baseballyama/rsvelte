import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useAddButton } from './add.svelte.js';
import { cn } from '$lib/utils';
import CheckIcon from '@lucide/svelte/icons/check';
import AddAgentLogo from './add-agent-logo.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<button><div class="flex size-9 shrink-0 items-center justify-center"><!> <!></div> <span class="min-w-0 flex-1 truncate px-1 text-left font-mono text-xs select-text md:px-0"> </span></button>`);

export default function Add_button($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const buttonState = useAddButton();
	var button = root();

	$.attribute_effect(button, ($0) => ({ type: 'button', class: $0, ...rest, ...buttonState.props }), [
		() => cn('hover:bg-accent flex min-w-0 flex-1 items-center overflow-hidden rounded-l-md transition-colors md:pr-2 [&_svg]:size-3.5', $$props.class)
	]);

	var div = $.child(button);
	var node = $.child(div);

	{
		let $0 = $.derived(() => cn('absolute scale-0 transition-all ease-out', buttonState.root.clipboard.copied && 'scale-100'));

		CheckIcon(node, {
			get class() {
				return $.get($0);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => cn('absolute scale-100 transition-all ease-out', buttonState.root.clipboard.copied && 'scale-0'));

		AddAgentLogo(node_1, {
			get agent() {
				return buttonState.root.agent;
			},

			get class() {
				return $.get($0);
			}
		});
	}

	$.reset(div);

	var span = $.sibling(div, 2);
	var text = $.only_child(span, true);

	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(span, 'title', buttonState.root.addCommand);
		$.set_text(text, buttonState.root.addCommand);
	});

	$.append($$anchor, button);
	$.pop();
}