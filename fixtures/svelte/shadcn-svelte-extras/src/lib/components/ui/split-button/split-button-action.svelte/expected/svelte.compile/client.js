import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { useSplitButtonAction } from './split-button.svelte.js';
import { box } from 'svelte-toolbelt';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'onclick',
	'disabled',
	'loading',
	'children'
]);

export default function Split_button_action($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	const state = useSplitButtonAction({
		value: box.with(() => $$props.value),
		onclick: box.with(() => $$props.onclick)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => $$props.disabled || state.rootState.disabled);
				let $1 = $.derived(() => $$props.loading || state.rootState.loading);

				Button($$anchor, $.spread_props(
					{
						get disabled() {
							return $.get($0);
						},

						get loading() {
							return $.get($1);
						},
						onclick: (e) => state.onclick(e)
					},
					() => rest,
					{
						get ref() {
							return ref();
						},

						set ref($$value) {
							ref($$value);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_1 = $.first_child(fragment_2);

							$.snippet(node_1, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					}
				));
			}
		};

		$.if(node, ($$render) => {
			if (state.isActive) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}