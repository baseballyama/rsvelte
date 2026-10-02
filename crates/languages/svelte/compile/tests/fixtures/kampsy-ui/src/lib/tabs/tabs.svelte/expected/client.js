import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "$lib/index.js";

var root = $.from_html(`<div class="flex h-4 w-4 items-center justify-center"><div class="h-4 w-4"><!></div></div>`);
var root_1 = $.from_html(`<button><!> </button>`);
var root_2 = $.from_html(`<div class="-mb-px"><!></div>`);
var root_3 = $.from_html(`<div><!></div>`);

export default function Tabs($$anchor, $$props) {
	$.push($$props, true);

	const // if the tab is disabled does not matter if active or not
	// Active but the tab is disabled
	// Not active and the tab is disabled
	tabButton = ($$anchor, isActive = $.noop, tab = $.noop) => {
		var button = root_1();
		var node = $.child(button);

		{
			var consequent = ($$anchor) => {
				const Icon = $.derived(() => tab().icon);
				var div = root();
				var div_1 = $.child(div);
				var node_1 = $.child(div_1);

				$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
					Icon_1($$anchor, {});
				});

				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			};

			$.if(node, ($$render) => {
				if (tab().icon) $$render(consequent);
			});
		}

		var text = $.sibling(node);

		$.reset(button);

		$.template_effect(
			($0) => {
				button.disabled = disabled() || tab().disabled;
				$.set_class(button, 1, `flex items-center justify-center gap-x-[6px] text-xs transition-all ${$0 ?? ''} `);
				$.set_text(text, ` ${tab().title ?? ''}`);
			},
			[() => tabButtonFunc(isActive(), disabled(), tab().disabled)]
		);

		$.delegated('click', button, () => selected(tab().value));
		$.append($$anchor, button);
	};

	let disabled = $.prop($$props, 'disabled', 3, false),
		selected = $.prop($$props, 'selected', 15, ""),
		tabs = $.prop($$props, 'tabs', 3, undefined),
		type = $.prop($$props, 'type', 3, "default");

	const isSelected = (value) => {
		if (value === selected()) {
			return true;
		}

		return false;
	};

	const tabButtonFunc = (isActive, isDisabled, isDisabledSpecific) => {
		if (type() === "secondary") {
			// if the tab is disabled does not matter if active or not
			if (isDisabled || isDisabledSpecific) {
				return `cursor-not-allowed px-1.5 py-1 text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 rounded-md bg-kui-light-gray-alpha-400 
            dark:bg-kui-dark-gray-alpha-400`;
			}

			if (isActive) {
				return `px-1.5 py-1 text-kui-light-bg dark:text-kui-dark-bg rounded-md bg-kui-light-gray-1000 
                dark:bg-kui-dark-gray-1000`;
			}

			return `px-1.5 py-1 text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 rounded-md bg-kui-light-gray-alpha-400 
            dark:bg-kui-dark-gray-alpha-400 hover:bg-kui-light-gray-300 dark:hover:bg-kui-dark-gray-300`;
		}

		if (type() === "default") {
			if (isActive) {
				// Active but the tab is disabled
				if (isDisabled || isDisabledSpecific) {
					return `cursor-not-allowed px-[2px] py-3 border-b-2 border-kui-light-gray-1000 dark:border-kui-dark-gray-1000 
                text-kui-light-gray-900 dark:text-kui-dark-gray-900`;
				}

				return `px-[2px] py-3 border-b-2 border-kui-light-gray-1000 dark:border-kui-dark-gray-1000 
                text-kui-light-gray-1000 dark:text-kui-dark-gray-1000`;
			}

			// Not active and the tab is disabled
			if (isDisabled || isDisabledSpecific) {
				return `cursor-not-allowed px-[2px] py-3 border-b-2 border-transparent text-kui-light-gray-900 
                dark:text-kui-dark-gray-900`;
			}

			return `px-[2px] py-3 border-b-2 border-transparent text-kui-light-gray-900 dark:text-kui-dark-gray-900 
            hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000`;
		}

		return "";
	};

	let contClass = $.derived(() => {
		if (type() === "secondary") {
			return "gap-3";
		}

		return "gap-6 border-b border-kui-light-gray-200 dark:border-kui-dark-gray-400";
	});

	var div_2 = root_3();
	var node_2 = $.child(div_2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment = $.comment();
			var node_3 = $.first_child(fragment);

			$.each(node_3, 17, tabs, (tab) => tab.value, ($$anchor, tab) => {
				var div_3 = root_2();
				var node_4 = $.child(div_3);

				{
					var consequent_1 = ($$anchor) => {
						Tooltip($$anchor, {
							get text() {
								return $.get(tab).tooltip;
							},

							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => isSelected($.get(tab).value));

									tabButton($$anchor, () => $.get($0), () => $.get(tab));
								}
							},
							$$slots: { default: true }
						});
					};

					var alternate = ($$anchor) => {
						{
							let $0 = $.derived(() => isSelected($.get(tab).value));

							tabButton($$anchor, () => $.get($0), () => $.get(tab));
						}
					};

					$.if(node_4, ($$render) => {
						if ($.get(tab).disabled) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.reset(div_3);
				$.append($$anchor, div_3);
			});

			$.append($$anchor, fragment);
		};

		$.if(node_2, ($$render) => {
			if (tabs()) $$render(consequent_2);
		});
	}

	$.reset(div_2);
	$.template_effect(() => $.set_class(div_2, 1, `flex w-full items-center ${$.get(contClass) ?? ''}`));
	$.append($$anchor, div_2);
	$.pop();
}

$.delegate(['click']);