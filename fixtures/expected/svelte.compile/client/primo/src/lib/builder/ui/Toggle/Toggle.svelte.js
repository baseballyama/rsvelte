import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import ToggleCore from './ToggleCore.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'toggled',
	'label',
	'hideLabel',
	'small',
	'disabled',
	'on',
	'off',
	'switchColor',
	'toggledColor',
	'untoggledColor',
	'children'
]);

var root = $.from_html(`<span class="svelte-vzdnzf"> </span>`);
var root_1 = $.from_html(`<label> </label> <div class="svelte-vzdnzf"><button></button> <!></div>`, 1);

export default function Toggle($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {boolean} [toggled] - Specify whether the toggle switch is toggled
	 * @property {string} [label] - Specify the label text
	 * @property {boolean} [hideLabel] - Set to `true` to visually hide the label
	 * @property {boolean} [small] - Set to `true` to use the small variant
	 * @property {boolean} [disabled] - Set to `true` to disable the button
	 * @property {string} [on] - Set a descriptor for the toggled state
	 * @property {string} [off] - Set a descriptor for the untoggled state
	 * @property {string} [switchColor] - Specify the switch color
	 * @property {string} [toggledColor] - Specify the toggled switch background color
	 * @property {string} [untoggledColor] - Specify the untoggled switch background color
	 * @property {import('svelte').Snippet<[any]>} [children]
	 */
	/** @type {Props & { [key: string]: any }} */
	let toggled = $.prop($$props, 'toggled', 15, true),
		label = $.prop($$props, 'label', 3, ''),
		hideLabel = $.prop($$props, 'hideLabel', 3, false),
		small = $.prop($$props, 'small', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		on = $.prop($$props, 'on', 3, undefined),
		off = $.prop($$props, 'off', 3, undefined),
		switchColor = $.prop($$props, 'switchColor', 3, '#fff'),
		toggledColor = $.prop($$props, 'toggledColor', 3, '#0f62fe'),
		untoggledColor = $.prop($$props, 'untoggledColor', 3, '#8d8d8d'),
		rest = $.rest_props($$props, rest_excludes);

	const dispatch = createEventDispatcher();

	{
		const children = ($$anchor, $$arg0) => {
			let labelProps = () => ($$arg0?.()).label;
			let button = () => ($$arg0?.()).button;
			var fragment_1 = root_1();
			var label_1 = $.first_child(fragment_1);

			$.attribute_effect(label_1, () => ({ ...labelProps(), [$.CLASS]: { hideLabel: hideLabel() } }), void 0, void 0, void 0, 'svelte-vzdnzf');

			var text = $.only_child(label_1, true);
			var div = $.sibling(label_1, 2);
			var button_1 = $.child(div);
			var event_handler = () => dispatch('toggle', !toggled());

			$.attribute_effect(
				button_1,
				() => ({
					...rest,
					...button(),
					style: `color: ${switchColor() ?? ''}; background-color: ${(toggled() ? toggledColor() : untoggledColor()) ?? ''};
	      ${$$props.style ?? ''}`,
					disabled: disabled(),
					'aria-label': label(),
					onclick: event_handler,
					onfocus,
					onblur,
					[$.CLASS]: { small: small() }
				}),
				void 0,
				void 0,
				void 0,
				'svelte-vzdnzf'
			);

			var node = $.sibling(button_1, 2);

			{
				var consequent = ($$anchor) => {
					$$props.children($$anchor, () => ({ toggled: toggled() }));
				};

				var consequent_1 = ($$anchor) => {
					var span = root();
					var text_1 = $.only_child(span, true);

					$.template_effect(() => $.set_text(text_1, toggled() ? on() : off()));
					$.append($$anchor, span);
				};

				$.if(node, ($$render) => {
					if ($$props.children) $$render(consequent); else if (on() && off()) $$render(consequent_1, 1);
				});
			}

			$.reset(div);
			$.template_effect(() => $.set_text(text, label()));
			$.append($$anchor, fragment_1);
		};

		ToggleCore($$anchor, {
			get toggled() {
				return toggled();
			},

			set toggled($$value) {
				toggled($$value);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.pop();
}