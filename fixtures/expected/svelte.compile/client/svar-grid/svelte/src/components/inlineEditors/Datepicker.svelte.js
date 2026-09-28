import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { Calendar, Dropdown } from "@svar-ui/svelte-core";

var root = $.from_html(`<span class="wx-text svelte-1vdx3gg"> </span>`);
var root_1 = $.from_html(`<div class="wx-value svelte-1vdx3gg" tabindex="0"><!></div> <!>`, 1);

export default function Datepicker($$anchor, $$props) {
	$.push($$props, true);

	let value = $.proxy($$props.editor.value || new Date());

	let tmp = $$props.editor?.config || {},
		template = $.proxy(tmp.template),
		cell = $.proxy(tmp.cell),
		dropdown = $.proxy($.fallback(tmp.dropdown, () => ({}), true));

	const dropdownOptions = $.derived(() => ({ trackScroll: true, width: "auto", ...dropdown }));

	function updateValue({ value }) {
		$$props.onapply(value);
		$$props.onsave();
	}

	let node;

	onMount(() => {
		node.focus();

		if (window.getSelection) {
			window.getSelection().removeAllRanges();
		}
	});

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(($0) => $.set_text(text, $0), [() => template(value)]);
			$.append($$anchor, text);
		};

		var consequent_1 = ($$anchor) => {
			const SvelteComponent = $.derived(() => cell);
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_1) => {
				SvelteComponent_1($$anchor, {
					get data() {
						return $$props.editor.value;
					},

					get onaction() {
						return $$props.onaction;
					}
				});
			});

			$.append($$anchor, fragment_2);
		};

		var alternate = ($$anchor) => {
			var span = root();
			var text_1 = $.only_child(span, true);

			$.template_effect(() => $.set_text(text_1, $$props.editor.renderedValue));
			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if (template) $$render(consequent); else if (cell) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => node = $$value, () => node);

	var node_3 = $.sibling(div, 2);

	Dropdown(node_3, $.spread_props(() => $.get(dropdownOptions), {
		oncancel: () => $$props.oncancel(true),
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => $$props.editor.config?.buttons);

				Calendar($$anchor, {
					get value() {
						return value;
					},
					onchange: updateValue,
					get buttons() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	}));

	$.delegated('click', div, function (...$$args) {
		$$props.oncancel?.apply(this, $$args);
	});

	$.delegated('keydown', div, (ev) => ev.preventDefault());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);