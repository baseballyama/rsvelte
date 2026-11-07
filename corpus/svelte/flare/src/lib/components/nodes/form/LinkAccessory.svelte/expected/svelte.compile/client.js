import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTypedNode } from '$lib/node.svelte';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Button } from '$lib/components/ui/button';

export default function LinkAccessory($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: 'Form.LinkAccessory'
		}))),
		componentProps = $.derived(() => $.get($$d).props);

	function handleClick() {
		if ($.get(componentProps)?.target) {
			openUrl($.get(componentProps).target);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				variant: 'link',
				class: 'text-muted-foreground hover:text-foreground px-0 text-sm underline',
				onclick: handleClick,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(componentProps).text));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(componentProps)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}