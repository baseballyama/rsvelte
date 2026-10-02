import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Loader2 } from '@lucide/svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'variant',
	'href',
	'type',
	'loading',
	'disabled',
	'full',
	'onclick',
	'children'
]);

var root = $.from_html(`<a><!> <!></a>`);
var root_1 = $.from_html(`<button><!> <!></button>`);

export default function Ll_button($$anchor, $$props) {
	/**
	 * Lime button — square (no radius), uppercase, thin outline.
	 * `filled` = plum background / white text; `outline` = plum text on white
	 * with a 1px current-color border, matching the source CTA buttons.
	 * Shows an inline spinner while `loading`, per the project's async-button rule.
	 */
	let variant = $.prop($$props, 'variant', 3, 'filled'),
		type = $.prop($$props, 'type', 3, 'button'),
		loading = $.prop($$props, 'loading', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		full = $.prop($$props, 'full', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var a = root();

			$.attribute_effect(
				a,
				() => ({
					href: $$props.href,
					class: `ll-btn ll-btn--${variant() ?? ''}`,
					'aria-disabled': disabled() || loading(),
					...rest,
					[$.CLASS]: {
						'll-btn--full': full(),
						'll-btn--disabled': disabled() || loading()
					}
				}),
				void 0,
				void 0,
				void 0,
				'svelte-kb7xdd'
			);

			var node_1 = $.child(a);

			{
				var consequent = ($$anchor) => {
					Loader2($$anchor, { class: 'll-btn-spin' });
				};

				$.if(node_1, ($$render) => {
					if (loading()) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			$.snippet(node_2, () => $$props.children);
			$.reset(a);
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var button = root_1();

			$.attribute_effect(
				button,
				() => ({
					type: type(),
					class: `ll-btn ll-btn--${variant() ?? ''}`,
					disabled: disabled() || loading(),
					onclick: $$props.onclick,
					...rest,
					[$.CLASS]: { 'll-btn--full': full() }
				}),
				void 0,
				void 0,
				void 0,
				'svelte-kb7xdd'
			);

			var node_3 = $.child(button);

			{
				var consequent_2 = ($$anchor) => {
					Loader2($$anchor, { class: 'll-btn-spin' });
				};

				$.if(node_3, ($$render) => {
					if (loading()) $$render(consequent_2);
				});
			}

			var node_4 = $.sibling(node_3, 2);

			$.snippet(node_4, () => $$props.children);
			$.reset(button);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($$props.href) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}