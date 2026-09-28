import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { box, mergeProps } from 'svelte-toolbelt';
import { usePasswordInput } from './password.svelte.js';
import { Input } from '$lib/components/ui/input';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'class',
	'children'
]);

var root = $.from_html(`<div class="relative"><!> <!></div>`);

export default function Password_input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ''),
		rest = $.rest_props($$props, rest_excludes);

	const state = usePasswordInput({
		value: box.with(() => value(), (v) => value(v)),
		ref: box.with(() => ref())
	});

	const mergedProps = $.derived(() => mergeProps(rest, state.props));
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => state.root.opts.hidden.current ? 'password' : 'text');

		let $1 = $.derived(() => cn(
			'transition-[width]',
			{
				'pr-9': state.root.passwordState.copyMounted || state.root.passwordState.toggleMounted,
				'pr-[4.5rem]': state.root.passwordState.copyMounted && state.root.passwordState.toggleMounted
			},
			$$props.class
		));

		Input(node, $.spread_props(() => $.get(mergedProps), {
			get type() {
				return $.get($0);
			},

			get class() {
				return $.get($1);
			},

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
		}));
	}

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}