import 'svelte/internal/disclose-version';
import { getContext, setContext } from "svelte";
import { toggleVariants } from "$lib/registry/ui/toggle/index.js";
import * as $ from 'svelte/internal/client';
import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export function setToggleGroupCtx(props) {
	setContext("toggleGroup", props);
}

export function getToggleGroupCtx() {
	return getContext("toggleGroup");
}

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'class',
	'size',
	'spacing',
	'orientation',
	'variant'
]);

export default function Toggle_group($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		size = $.prop($$props, 'size', 3, "default"),
		spacing = $.prop($$props, 'spacing', 3, 0),
		orientation = $.prop($$props, 'orientation', 3, "horizontal"),
		variant = $.prop($$props, 'variant', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	setToggleGroupCtx({
		get variant() {
			return variant();
		},

		get size() {
			return size();
		},

		get spacing() {
			return spacing();
		},

		get orientation() {
			return orientation();
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => `--gap: ${spacing()}`);
		let $1 = $.derived(() => cn("cn-toggle-group group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch", $$props.class));

		$.component(node, () => ToggleGroupPrimitive.Root, ($$anchor, ToggleGroupPrimitive_Root) => {
			ToggleGroupPrimitive_Root($$anchor, $.spread_props(
				{
					get orientation() {
						return orientation();
					},
					'data-slot': 'toggle-group',
					get 'data-variant'() {
						return variant();
					},

					get 'data-size'() {
						return size();
					},

					get 'data-spacing'() {
						return spacing();
					},

					get style() {
						return $.get($0);
					},

					get class() {
						return $.get($1);
					}
				},
				() => restProps,
				{
					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					},

					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}