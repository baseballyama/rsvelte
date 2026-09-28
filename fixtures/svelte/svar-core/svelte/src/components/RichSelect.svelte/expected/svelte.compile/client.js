import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List from "./helpers/SuggestDropdown.svelte";

var root = $.from_html(`<span class="wx-placeholder svelte-bh7w1q"> </span>`);
var root_1 = $.from_html(`<i class="wx-icon wxi-close svelte-bh7w1q"></i>`);
var root_2 = $.from_html(`<i class="wx-icon wxi-angle-down svelte-bh7w1q"></i>`);
var root_3 = $.from_html(`<div tabindex="0"><div class="wx-label svelte-bh7w1q"><!></div> <!> <!></div>`);

export default function RichSelect($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		options = $.prop($$props, 'options', 19, () => []),
		textOptions = $.prop($$props, 'textOptions', 3, null),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		title = $.prop($$props, 'title', 3, ""),
		textField = $.prop($$props, 'textField', 3, "label"),
		clear = $.prop($$props, 'clear', 3, false),
		css = $.prop($$props, 'css', 3, ""),
		dropdown = $.prop($$props, 'dropdown', 19, () => ({}));

	let navigate;
	let keydown;

	function ready(ev) {
		navigate = ev.navigate;
		keydown = ev.keydown;
	}

	let selected = $.derived(() => value() || value() === 0
		? (textOptions() || options()).find((a) => a.id === value())
		: null);

	function select({ id }) {
		if (id || id === 0) {
			value(id);
			navigate(null);
			$$props.onchange && $$props.onchange({ value: value() });
		}
	}

	function unselect(ev) {
		ev.stopPropagation();
		value("");
		$$props.onchange && $$props.onchange({ value: value() });
	}

	const index = () => options().findIndex((a) => a.id === value());
	var div = root_3();
	let classes;
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.children, () => $.get(selected));
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(selected)[textField()]));
					$.append($$anchor, text);
				};

				$.if(node_1, ($$render) => {
					if ($$props.children) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		var consequent_2 = ($$anchor) => {
			var span = root();
			var text_1 = $.only_child(span, true);

			$.template_effect(() => $.set_text(text_1, placeholder()));
			$.append($$anchor, span);
		};

		var alternate_1 = ($$anchor) => {
			var text_2 = $.text(' ');

			$.append($$anchor, text_2);
		};

		$.if(node, ($$render) => {
			if ($.get(selected)) $$render(consequent_1); else if (placeholder()) $$render(consequent_2, 1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var i = root_1();

			$.delegated('click', i, unselect);
			$.append($$anchor, i);
		};

		var alternate_2 = ($$anchor) => {
			var i_1 = root_2();

			$.append($$anchor, i_1);
		};

		$.if(node_3, ($$render) => {
			if (clear() && !disabled() && value()) $$render(consequent_3); else $$render(alternate_2, -1);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_5 = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let option = () => ($$arg0?.()).option;
					var fragment_4 = $.comment();
					var node_5 = $.first_child(fragment_4);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_6 = $.first_child(fragment_5);

							$.snippet(node_6, () => $$props.children, option);
							$.append($$anchor, fragment_5);
						};

						var alternate_3 = ($$anchor) => {
							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, option()[textField()]));
							$.append($$anchor, text_3);
						};

						$.if(node_5, ($$render) => {
							if ($$props.children) $$render(consequent_4); else $$render(alternate_3, -1);
						});
					}

					$.append($$anchor, fragment_4);
				};

				List($$anchor, $.spread_props(
					{
						get items() {
							return options();
						},
						onready: ready,
						onselect: select
					},
					dropdown,
					{ children, $$slots: { default: true } }
				));
			}
		};

		$.if(node_4, ($$render) => {
			if (!disabled()) $$render(consequent_5);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, `wx-richselect ${css() ?? ''}`, 'svelte-bh7w1q', classes, {
			'wx-error': error(),
			'wx-disabled': disabled(),
			'wx-nowrap': !$$props.children
		});

		$.set_attribute(div, 'title', title());
		$.set_attribute(div, 'data-tooltip-text', $$props.tooltip);
	});

	$.delegated('click', div, () => navigate?.(index()));
	$.delegated('keydown', div, (ev) => keydown?.(ev, index()));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);