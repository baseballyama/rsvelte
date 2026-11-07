import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconButton from './IconButton.svelte';
import Tooltip from './Tooltip.svelte';

var root = $.from_html(`<span> </span>`);

export default function ToolbarButton($$anchor, $$props) {
	$.push($$props, true);

	const button = ($$anchor) => {
		IconButton($$anchor, {
			get onclick() {
				return $$props.onclick;
			},

			get disabled() {
				return disabled();
			},

			get active() {
				return active();
			},

			get warn() {
				return warn();
			},

			get success() {
				return success();
			},

			get icon() {
				return $$props.icon;
			},

			get label() {
				return $$props.label;
			},

			get error() {
				return error();
			}
		});
	};

	let active = $.prop($$props, 'active', 3, false),
		warn = $.prop($$props, 'warn', 3, false),
		success = $.prop($$props, 'success', 3, false),
		error = $.prop($$props, 'error', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		tooltipProp = $.prop($$props, 'tooltip', 3, '');

	var fragment_1 = $.comment();
	var node = $.first_child(fragment_1);

	{
		var consequent = ($$anchor) => {
			{
				const tooltip = ($$anchor) => {
					var span = root();
					var text = $.only_child(span, true);

					$.template_effect(() => $.set_text(text, tooltipProp()));
					$.append($$anchor, span);
				};

				Tooltip($$anchor, {
					tooltip,
					children: ($$anchor, $$slotProps) => {
						button($$anchor);
					},
					$$slots: { tooltip: true, default: true }
				});
			}
		};

		var alternate = ($$anchor) => {
			button($$anchor);
		};

		$.if(node, ($$render) => {
			if (tooltipProp().length) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}