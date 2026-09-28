import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="p-3 text-sm text-gray-500 italic">No props available</div>`);
var root_1 = $.from_html(`<div class="prop-value text-gray-600">default: <span class="font-mono"> </span></div>`);
var root_2 = $.from_html(`<div class="prop-item flex rounded p-1.5 text-sm hover:bg-gray-100"><div class="prop-name flex-grow font-mono text-violet-700"> </div> <!></div>`);
var root_3 = $.from_html(`<div class="p-2"></div>`);
var root_4 = $.from_html(`<div class="props-content border-t border-gray-200"><!></div>`);
var root_5 = $.from_html(`<div class="json-view my-2 mb-8 overflow-hidden rounded-md border border-gray-200 bg-gray-50"><button class="toggle-btn flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-gray-100"><div class="flex items-center gap-2"><span class="text-gray-600"> </span> <span class="font-medium"> </span> <a target="_blank" rel="noopener noreferrer" class="ml-2 text-sm text-blue-600 hover:underline"> </a></div> <span class="text-sm text-gray-500"> </span></button> <!></div>`);

export default function JSONView($$anchor, $$props) {
	$.push($$props, true);

	// Updated props data interface to match your actual data structure exactly
	// This matches your actual data structure
	// Component props
	let initiallyExpanded = $.prop($$props, 'initiallyExpanded', 3, false);

	// State
	let expanded = $.state(false);

	$.user_effect(() => {
		$.set(expanded, initiallyExpanded());
	});

	// Toggle expanded state
	function toggle() {
		$.set(expanded, !$.get(expanded));
	}

	// Check if a prop has a default value
	function hasDefaultValue(propArray) {
		// Check if there is a second element and it's not an empty string
		return propArray.length > 1 && propArray[1] !== "";
	}

	var div = root_5();
	var button = $.child(div);
	var div_1 = $.child(button);
	var span = $.child(div_1);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);
	var a = $.sibling(span_1, 2);
	var text_2 = $.only_child(a);

	$.reset(div_1);

	var span_2 = $.sibling(div_1, 2);
	var text_3 = $.only_child(span_2);

	$.reset(button);

	var node = $.sibling(button, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_4();
			var node_1 = $.child(div_2);

			{
				var consequent = ($$anchor) => {
					var div_3 = root();

					$.append($$anchor, div_3);
				};

				var alternate = ($$anchor) => {
					var div_4 = root_3();

					$.each(div_4, 21, () => $$props.data.props, $.index, ($$anchor, propArray) => {
						var div_5 = root_2();
						var div_6 = $.child(div_5);
						var text_4 = $.only_child(div_6, true);
						var node_2 = $.sibling(div_6, 2);

						{
							var consequent_1 = ($$anchor) => {
								var div_7 = root_1();
								var span_3 = $.sibling($.child(div_7));
								var text_5 = $.only_child(span_3, true);

								$.reset(div_7);
								$.template_effect(() => $.set_text(text_5, $.get(propArray)[1]));
								$.append($$anchor, div_7);
							};

							var d = $.derived(() => hasDefaultValue($.get(propArray)));

							$.if(node_2, ($$render) => {
								if ($.get(d)) $$render(consequent_1);
							});
						}

						$.reset(div_5);
						$.template_effect(() => $.set_text(text_4, $.get(propArray)[0]));
						$.append($$anchor, div_5);
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_1, ($$render) => {
					if ($$props.data.props.length === 0) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(expanded)) $$render(consequent_2);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $.get(expanded) ? "▼" : "►");
		$.set_text(text_1, $$props.data.name);
		$.set_attribute(a, 'href', $$props.data.type.link);
		$.set_text(text_2, `Type: ${$$props.data.type.name ?? ''}`);
		$.set_text(text_3, `${$$props.data.props.length ?? ''} props`);
	});

	$.delegated('click', button, toggle);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);