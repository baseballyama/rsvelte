import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from "svelte";
import { fade } from "svelte/transition";
import Button from "../Button.svelte";

var root = $.from_html(`<div class="wx-header svelte-mkj13s"> </div>`);
var root_1 = $.from_html(`<div class="wx-button svelte-mkj13s"><!></div>`);
var root_2 = $.from_html(`<div class="wx-buttons svelte-mkj13s"></div>`);
var root_3 = $.from_html(`<div class="wx-modal svelte-mkj13s" tabindex="0"><div class="wx-window svelte-mkj13s"><!> <div><!></div> <!></div></div>`);

export default function Layout($$anchor, $$props) {
	$.push($$props, true);

	const _ = getContext("wx-i18n").getGroup("core");

	const title = $.prop($$props, 'title', 3, ""),
		buttons = $.prop($$props, 'buttons', 19, () => ["cancel", "ok"]);

	function keydown(ev) {
		switch (ev.code) {
			case "Enter":
				{
					const from = ev.target.tagName;

					if (from === "TEXTAREA" || from === "BUTTON") return;

					$$props.onconfirm && $$props.onconfirm({ ev });

					break;
				}

			case "Escape":
				$$props.oncancel && $$props.oncancel({ ev });
				break;
		}
	}

	function onclick(ev, button) {
		const pack = { ev, button };

		if (button === "cancel") {
			$$props.oncancel && $$props.oncancel(pack);
		} else {
			$$props.onconfirm && $$props.onconfirm(pack);
		}
	}

	let modal;

	onMount(() => {
		modal.focus();
	});

	var div = root_3();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.header);
			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var div_2 = root();
			var text = $.only_child(div_2, true);

			$.template_effect(() => $.set_text(text, title()));
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($$props.header) $$render(consequent); else if (title()) $$render(consequent_1, 1);
		});
	}

	var div_3 = $.sibling(node, 2);
	var node_2 = $.child(div_3);

	$.snippet(node_2, () => $$props.children);
	$.reset(div_3);

	var node_3 = $.sibling(div_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_4 = $.first_child(fragment_1);

			$.snippet(node_4, () => $$props.footer);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div_4 = root_2();

			$.each(div_4, 21, buttons, $.index, ($$anchor, button) => {
				var div_5 = root_1();
				var node_5 = $.child(div_5);

				{
					let $0 = $.derived(() => $.get(button) === 'ok' ? 'primary' : 'secondary');

					Button(node_5, {
						get type() {
							return `block ${$.get($0) ?? ''}`;
						},
						onclick: (ev) => onclick(ev, $.get(button)),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(($0) => $.set_text(text_1, $0), [() => _($.get(button))]);
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}

				$.reset(div_5);
				$.append($$anchor, div_5);
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_3, ($$render) => {
			if ($$props.footer) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => modal = $$value, () => modal);
	$.delegated('keydown', div, keydown);
	$.transition(3, div, () => fade, () => ({ duration: 100 }));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown']);