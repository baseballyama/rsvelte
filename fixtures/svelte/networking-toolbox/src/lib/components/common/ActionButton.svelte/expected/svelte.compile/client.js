import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<button><!></button>`);

export default function ActionButton($$anchor, $$props) {
	let loading = $.prop($$props, 'loading', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		loadingIcon = $.prop($$props, 'loadingIcon', 3, 'loader'),
		className = $.prop($$props, 'class', 3, '');

	const isDisabled = $.derived(() => loading() || disabled());
	var button = root_2();
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Icon(node_1, {
				get name() {
					return loadingIcon();
				},
				size: 'sm',
				animate: 'spin'
			});

			var text = $.sibling(node_1);

			$.template_effect(() => $.set_text(text, ` ${($$props.loadingText || $$props.children) ?? ''}`));
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					Icon($$anchor, {
						get name() {
							return $$props.icon;
						},
						size: 'sm'
					});
				};

				$.if(node_2, ($$render) => {
					if ($$props.icon) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			$.snippet(node_3, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (loading()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	$.template_effect(() => {
		$.set_class(button, 1, `lookup-btn ${className() ?? ''}`);
		button.disabled = $.get(isDisabled);
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);