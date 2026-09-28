import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { Portal } from "../index.js";
import Popup from "./Popup.svelte";
import InlineDropdown from "./helpers/InlineDropdown.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'position',
	'align',
	'autoFit',
	'inline',
	'oncancel',
	'width'
]);

var root = $.from_html(`<!> <span class="wx-portal-node svelte-5utc01"></span>`, 1);

export default function Dropdown($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 3, "bottom"),
		align = $.prop($$props, 'align', 3, "start"),
		autoFit = $.prop($$props, 'autoFit', 3, true),
		inline = $.prop($$props, 'inline', 3, false),
		width = $.prop($$props, 'width', 3, "100%"),
		props = $.rest_props($$props, rest_excludes);

	let target = $.state(void 0);
	let node = $.state(void 0);
	const at = $.derived(() => `${position()}-${align()}`);

	onMount(() => {
		// get the parent element before
		// the popup is moved to the portal
		$.set(target, $.get(node).parentNode, true);
	});

	var fragment = root();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			InlineDropdown($$anchor, $.spread_props(
				{
					get oncancel() {
						return $$props.oncancel;
					},

					get position() {
						return position();
					},

					get align() {
						return align();
					},

					get autoFit() {
						return autoFit();
					},

					get width() {
						return width();
					}
				},
				() => props
			));
		};

		var alternate = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Popup($$anchor, $.spread_props(
						{
							get parent() {
								return $.get(target);
							},

							get at() {
								return $.get(at);
							},

							get oncancel() {
								return $$props.oncancel;
							},

							get width() {
								return width();
							}
						},
						() => props
					));
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if (inline()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var span = $.sibling(node_1, 2);

	$.bind_this(span, ($$value) => $.set(node, $$value), () => $.get(node));
	$.append($$anchor, fragment);
	$.pop();
}