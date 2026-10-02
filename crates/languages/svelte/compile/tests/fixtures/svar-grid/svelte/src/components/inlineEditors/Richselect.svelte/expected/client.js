import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { SuggestDropdown } from "@svar-ui/svelte-core";
import { clickOutside } from "@svar-ui/lib-dom";

var root = $.from_html(`<span class="wx-text svelte-1kf9vkg"> </span>`);
var root_1 = $.from_html(`<div class="wx-value svelte-1kf9vkg" tabindex="0"><!></div> <!>`, 1);

export default function Richselect($$anchor, $$props) {
	$.push($$props, true);

	let data = $.proxy($$props.editor.options.find((opt) => opt.id === $$props.editor.value));

	let tmp = $$props.editor,
		value = $.proxy(tmp.value),
		options = $.proxy(tmp.options);

	let tmp_1 = $$props.editor?.config || {},
		template = $.proxy(tmp_1.template),
		cell = $.proxy(tmp_1.cell),
		dropdown = $.proxy($.fallback(tmp_1.dropdown, () => ({}), true));

	const dropdownOptions = $.derived(() => ({ trackScroll: true, ...dropdown }));
	let index = $.derived(() => options.findIndex((a) => a.id === value));

	function updateValue({ id }) {
		$$props.onapply(id);
		$$props.onsave();
	}

	let navigate;
	let keydown = $.state(void 0);

	function ready(ev) {
		navigate = ev.navigate;
		$.set(keydown, ev.keydown, true);
		navigate($.get(index));
	}

	let node = $.state(void 0);

	onMount(() => {
		$.get(node).focus();

		if (window && window.getSelection) {
			window.getSelection().removeAllRanges();
		}
	});

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(($0) => $.set_text(text, $0), [() => template(data)]);
			$.append($$anchor, text);
		};

		var consequent_1 = ($$anchor) => {
			const SvelteComponent = $.derived(() => cell);
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_2) => {
				SvelteComponent_2($$anchor, {
					get data() {
						return data;
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
	$.bind_this(div, ($$value) => $.set(node, $$value), () => $.get(node));
	$.action(div, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => $$props.onsave(true));

	var node_3 = $.sibling(div, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let option = () => ($$arg0?.()).option;
			var fragment_3 = $.comment();
			var node_4 = $.first_child(fragment_3);

			{
				var consequent_2 = ($$anchor) => {
					var text_2 = $.text();

					$.template_effect(($0) => $.set_text(text_2, $0), [() => template(option())]);
					$.append($$anchor, text_2);
				};

				var consequent_3 = ($$anchor) => {
					const SvelteComponent_1 = $.derived(() => cell);
					var fragment_5 = $.comment();
					var node_5 = $.first_child(fragment_5);

					$.component(node_5, () => $.get(SvelteComponent_1), ($$anchor, SvelteComponent_1_1) => {
						SvelteComponent_1_1($$anchor, {
							get data() {
								return option();
							},

							get onaction() {
								return $$props.onaction;
							}
						});
					});

					$.append($$anchor, fragment_5);
				};

				var alternate_1 = ($$anchor) => {
					var text_3 = $.text();

					$.template_effect(() => $.set_text(text_3, option().label));
					$.append($$anchor, text_3);
				};

				$.if(node_4, ($$render) => {
					if (template) $$render(consequent_2); else if (cell) $$render(consequent_3, 1); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_3);
		};

		SuggestDropdown(node_3, $.spread_props(
			{
				get items() {
					return options;
				},
				onready: ready,
				onselect: updateValue
			},
			() => $.get(dropdownOptions),
			{ children, $$slots: { default: true } }
		));
	}

	$.delegated('click', div, function (...$$args) {
		$$props.oncancel?.apply(this, $$args);
	});

	$.delegated('keydown', div, (ev) => {
		$.get(keydown)(ev, $.get(index));
		ev.preventDefault();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);