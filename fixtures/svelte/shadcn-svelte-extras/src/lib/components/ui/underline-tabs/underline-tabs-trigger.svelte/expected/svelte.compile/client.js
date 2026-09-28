import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs as TabsPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import { receive, send, useUnderlineTabsTrigger } from './underline-tabs.svelte.js';
import { box } from 'svelte-toolbelt';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'class',
	'onmouseenter',
	'onmouseleave',
	'onfocus',
	'onblur',
	'children'
]);

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div class="bg-primary absolute -bottom-px z-1 h-0.5 w-full"></div>`);
var root_2 = $.from_html(`<div class="relative h-full"><!> <!> <!></div>`);

export default function Underline_tabs_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const state = useUnderlineTabsTrigger({
		value: box.with(() => $$props.value),
		onmouseenter: box.with(() => $$props.onmouseenter),
		onmouseleave: box.with(() => $$props.onmouseleave),
		onfocus: box.with(() => $$props.onfocus),
		onblur: box.with(() => $$props.onblur)
	});

	var div = root_2();
	var node = $.child(div);

	{
		let $0 = $.derived(() => cn("dark:data-[state=active]:text-foreground data-[state=active]:text-foreground text-muted-foreground relative z-2 inline-flex h-[calc(100%-3px)] flex-1 items-center justify-center gap-1.5 px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", state.rootState.isHovered && state.rootState.hoveredTab === $$props.value && 'data-[state=inactive]:text-foreground!', $$props.class));

		$.component(node, () => TabsPrimitive.Trigger, ($$anchor, TabsPrimitive_Trigger) => {
			TabsPrimitive_Trigger($$anchor, $.spread_props(
				{
					'data-slot': 'underline-tabs-trigger',
					get class() {
						return $.get($0);
					}
				},
				() => state.props,
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment = $.comment();
						var node_1 = $.first_child(fragment);

						$.snippet(node_1, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.template_effect(($0) => $.set_class(div_1, 1, $0), [
				() => $.clsx(cn('bg-accent absolute top-0 z-1 h-[calc(100%-3px)] w-full rounded-md opacity-0 transition-opacity duration-300 peer-focus-visible:opacity-100', state.rootState.isHovered && 'opacity-100'))
			]);

			$.transition(1, div_1, () => receive, () => ({
				key: `${state.rootState.opts.id.current}-tab-hover`,
				duration: 300
			}));

			$.transition(2, div_1, () => send, () => ({
				key: `${state.rootState.opts.id.current}-tab-hover`,
				duration: 300
			}));

			$.append($$anchor, div_1);
		};

		$.if(node_2, ($$render) => {
			if (state.rootState.hoveredTab === $$props.value) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();

			$.transition(1, div_2, () => receive, () => ({
				key: `${state.rootState.opts.id.current}-tab-active-border`,
				duration: 200
			}));

			$.transition(2, div_2, () => send, () => ({
				key: `${state.rootState.opts.id.current}-tab-active-border`,
				duration: 200
			}));

			$.append($$anchor, div_2);
		};

		$.if(node_3, ($$render) => {
			if (state.rootState.opts.value.current === $$props.value) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}