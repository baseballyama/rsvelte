import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckmarkIcon from './CheckmarkIcon.svelte';
import ErrorIcon from './ErrorIcon.svelte';
import LoaderIcon from './LoaderIcon.svelte';

var root = $.from_html(`<div class="_sft-animated svelte-cjoyi"> </div>`);
var root_1 = $.from_html(`<div class="_sft-status svelte-cjoyi"><!></div>`);
var root_2 = $.from_html(`<div class="_sft-indicator svelte-cjoyi"><!> <!></div>`);

export default function ToastIcon($$anchor, $$props) {
	let type = $.derived(() => $$props.toast.type),
		icon = $.derived(() => $$props.toast.icon),
		iconTheme = $.derived(() => $$props.toast.iconTheme);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var text = $.only_child(div, true);

			$.template_effect(() => $.set_text(text, $.get(icon)));
			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			const IconComponent = $.derived(() => $.get(icon));
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => $.get(IconComponent), ($$anchor, IconComponent_1) => {
				IconComponent_1($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_4 = ($$anchor) => {
			var div_1 = root_2();
			var node_2 = $.child(div_1);

			LoaderIcon(node_2, $.spread_props(() => $.get(iconTheme)));

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_2 = root_1();
					var node_4 = $.child(div_2);

					{
						var consequent_2 = ($$anchor) => {
							ErrorIcon($$anchor, $.spread_props(() => $.get(iconTheme)));
						};

						var alternate = ($$anchor) => {
							CheckmarkIcon($$anchor, $.spread_props(() => $.get(iconTheme)));
						};

						$.if(node_4, ($$render) => {
							if ($.get(type) === 'error') $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_3, ($$render) => {
					if ($.get(type) !== 'loading') $$render(consequent_3);
				});
			}

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (typeof $.get(icon) === 'string') $$render(consequent); else if (typeof $.get(icon) !== 'undefined') $$render(consequent_1, 1); else if ($.get(type) !== 'blank') $$render(consequent_4, 2);
		});
	}

	$.append($$anchor, fragment);
}