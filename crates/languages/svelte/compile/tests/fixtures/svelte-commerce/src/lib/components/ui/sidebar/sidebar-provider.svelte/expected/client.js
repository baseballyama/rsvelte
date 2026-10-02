import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/core/utils/index.js';

import {
	SIDEBAR_COOKIE_MAX_AGE,
	SIDEBAR_COOKIE_NAME,
	SIDEBAR_WIDTH,
	SIDEBAR_WIDTH_ICON
} from './constants.js';

import { setSidebar } from './context.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'open',
	'onOpenChange',
	'controlledOpen',
	'class',
	'style',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Sidebar_provider($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		open = $.prop($$props, 'open', 15, true),
		onOpenChange = $.prop($$props, 'onOpenChange', 3, () => {}),
		controlledOpen = $.prop($$props, 'controlledOpen', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const sidebar = setSidebar({
		open: () => open(),
		setOpen: (value) => {
			if (controlledOpen()) {
				onOpenChange()(value);
			} else {
				open(value);
				onOpenChange()(value);
			}

			// This sets the cookie to keep the sidebar state.
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${open()}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		}
	});

	var fragment = $.comment();

	$.event('keydown', $.window, function (...$$args) {
		sidebar.handleShortcutKeydown?.apply(this, $$args);
	});

	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 0,
			children: ($$anchor, $$slotProps) => {
				var div = root();

				$.attribute_effect(
					div,
					($0) => ({
						style: `--sidebar-width: ${SIDEBAR_WIDTH ?? ''}; --sidebar-width-icon: ${SIDEBAR_WIDTH_ICON ?? ''}; ${$$props.style ?? ''}`,
						class: $0,
						...restProps
					}),
					[
						() => cn('group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar', $$props.class)
					]
				);

				var node_1 = $.child(div);

				$.snippet(node_1, () => $$props.children ?? $.noop);
				$.reset(div);
				$.bind_this(div, ($$value) => ref($$value), () => ref());
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}