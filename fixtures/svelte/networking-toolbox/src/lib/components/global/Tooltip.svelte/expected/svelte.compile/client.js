import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div class="tooltip-container svelte-14refyh" role="tooltip"><!> <!></div>`);

export default function Tooltip($$anchor, $$props) {
	let position = $.prop($$props, 'position', 3, 'top'),
		delay = $.prop($$props, 'delay', 3, 500);

	let showTooltip = $.state(false);
	let tooltipTimeout;

	/**
	 * Show tooltip after delay
	 */
	function handleMouseEnter() {
		tooltipTimeout = setTimeout(
			() => {
				$.set(showTooltip, true);
			},
			delay()
		);
	}

	/**
	 * Hide tooltip immediately
	 */
	function handleMouseLeave() {
		clearTimeout(tooltipTimeout);
		$.set(showTooltip, false);
	}

	var div = root_1();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var text_1 = $.only_child(div_1, true);

			$.template_effect(() => {
				$.set_class(div_1, 1, `tooltip ${position() ?? ''}`, 'svelte-14refyh');
				$.set_text(text_1, $$props.text);
			});

			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(showTooltip)) $$render(consequent);
		});
	}

	$.reset(div);
	$.event('mouseenter', div, handleMouseEnter);
	$.event('mouseleave', div, handleMouseLeave);
	$.append($$anchor, div);
}