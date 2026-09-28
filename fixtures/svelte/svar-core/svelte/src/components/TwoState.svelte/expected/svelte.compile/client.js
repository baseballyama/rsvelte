import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "./Button.svelte";

export default function TwoState($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 7, false),
		type = $.prop($$props, 'type', 3, ""),
		icon = $.prop($$props, 'icon', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		iconActive = $.prop($$props, 'iconActive', 3, ""),
		title = $.prop($$props, 'title', 3, ""),
		css = $.prop($$props, 'css', 3, ""),
		text = $.prop($$props, 'text', 3, ""),
		textActive = $.prop($$props, 'textActive', 3, "");

	let typeStr = $.derived(() => (value() ? "pressed" : "") + (type() ? " " + type() : ""));

	function handleClick(ev) {
		let next = !value();

		if ($$props.onclick) $$props.onclick(ev);

		if (!ev.defaultPrevented) {
			value(next);
			$$props.onchange && $$props.onchange({ value: value() });
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => value() && textActive() || text());
				let $1 = $.derived(() => value() && iconActive() || icon());

				Button($$anchor, {
					get title() {
						return title();
					},

					get tooltip() {
						return $$props.tooltip;
					},

					get text() {
						return $.get($0);
					},

					get css() {
						return css();
					},

					get type() {
						return $.get(typeStr);
					},

					get icon() {
						return $.get($1);
					},
					onclick: handleClick,
					get disabled() {
						return disabled();
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.snippet(node_1, () => $$props.active);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			}
		};

		var consequent_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => value() && textActive() || text());
				let $1 = $.derived(() => value() && iconActive() || icon());

				Button($$anchor, {
					get title() {
						return title();
					},

					get tooltip() {
						return $$props.tooltip;
					},

					get text() {
						return $.get($0);
					},

					get css() {
						return css();
					},

					get type() {
						return $.get(typeStr);
					},

					get icon() {
						return $.get($1);
					},
					onclick: handleClick,
					get disabled() {
						return disabled();
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_2 = $.first_child(fragment_4);

						$.snippet(node_2, () => $$props.children);
						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			}
		};

		var alternate = ($$anchor) => {
			{
				let $0 = $.derived(() => value() && textActive() || text());
				let $1 = $.derived(() => value() && iconActive() || icon());

				Button($$anchor, {
					get title() {
						return title();
					},

					get tooltip() {
						return $$props.tooltip;
					},

					get text() {
						return $.get($0);
					},

					get css() {
						return css();
					},

					get type() {
						return $.get(typeStr);
					},

					get icon() {
						return $.get($1);
					},
					onclick: handleClick,
					get disabled() {
						return disabled();
					}
				});
			}
		};

		$.if(node, ($$render) => {
			if (value() && $$props.active) $$render(consequent); else if ($$props.children) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}