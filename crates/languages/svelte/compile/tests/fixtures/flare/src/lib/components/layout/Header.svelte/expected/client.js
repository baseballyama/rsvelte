import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';
import LoadingIndicator from '../LoadingIndicator.svelte';
import Icon from '../Icon.svelte';

var root = $.from_html(`<div class="ml-2 flex items-center"><!></div>`);
var root_1 = $.from_html(`<header class="relative flex h-15 shrink-0 items-center border-b pr-4 pl-[18px]"><!> <div class="flex flex-grow items-center"><!></div> <!> <!></header>`);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	let showBackButton = $.prop($$props, 'showBackButton', 3, false),
		isLoading = $.prop($$props, 'isLoading', 3, false);

	const handleKeydown = (event) => {
		if (event.key === 'Escape' && !event.defaultPrevented && !event.altKey && !event.ctrlKey && !event.metaKey) {
			if (event.target instanceof HTMLElement && event.target.closest('[data-dropdown-menu-content]')) {
				// the user has a dropdown open, we want to close the dropdown instead of going back
				return;
			}

			if ($$props.onPopView) {
				event.preventDefault();
				$$props.onPopView();
			}
		}
	};

	var header = root_1();

	$.event('keydown', $.document, handleKeydown);

	var node = $.child(header);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				size: 'icon',
				get onclick() {
					return $$props.onPopView;
				},
				variant: 'secondary',
				class: 'size-6',
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, { icon: 'arrow-left-16' });
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (showBackButton()) $$render(consequent);
		});
	}

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	$.snippet(node_1, () => $$props.children);
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root();
			var node_3 = $.child(div_1);

			$.snippet(node_3, () => $$props.actions);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.actions) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	LoadingIndicator(node_4, {
		get isLoading() {
			return isLoading();
		}
	});

	$.reset(header);
	$.append($$anchor, header);
	$.pop();
}