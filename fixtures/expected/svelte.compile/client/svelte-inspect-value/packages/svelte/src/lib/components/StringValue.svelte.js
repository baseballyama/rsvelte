import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LinkIcon from './icons/LinkIcon.svelte';
import { useOptions } from '../options.svelte.js';
import { collapseString, stringify } from '../util.js';
import Highlight from './Highlight.svelte';

var root = $.from_html(`<span class="value url"><!></span>`);
var root_1 = $.from_html(`<!><!>`, 1);

export default function StringValue($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, 'string');
	const options = useOptions();

	const $$d = $.derived(() => options.value),
		stringCollapse = $.derived(() => $.get($$d).stringCollapse),
		quotes = $.derived(() => $.get($$d).quotes);

	let displayOrValue = $.derived(() => $$props.display != null ? $$props.display : $$props.value);
	let isUrlOrPath = $.derived(() => (type() === 'string' || type() === 'url') && (URL.canParse($.get(displayOrValue)) || $.get(displayOrValue).startsWith('/') || $$props.value.startsWith('data:')));
	let ele = $.derived(() => $.get(isUrlOrPath) ? 'a' : 'span');
	let collapsed = $.derived(() => collapseString($.get(displayOrValue), $.get(stringCollapse)));
	let stringified = $.derived(() => stringify($.get(collapsed), 0, $.get(quotes)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => $.get(ele), false, ($$element, $$anchor) => {
		$.attribute_effect(
			$$element,
			($0) => ({
				'data-testid': 'value',
				class: [
					'stringvalue',
					' value',
					type(),
					$.get(isUrlOrPath) && 'url-or-path'
				],
				title: $0,
				href: $.get(isUrlOrPath) ? $$props.value : null,
				target: $.get(isUrlOrPath) ? '_blank' : null,
				rel: $.get(isUrlOrPath) ? 'noreferrer' : null
			}),
			[() => stringify($$props.value)],
			void 0,
			void 0,
			'svelte-wi40ck'
		);

		var fragment_1 = root_1();
		var node_1 = $.first_child(fragment_1);

		Highlight(node_1, {
			get value() {
				return $.get(stringified);
			},
			fields: ['value'],
			get alsoMatch() {
				return $$props.value;
			}
		});

		var node_2 = $.sibling(node_1);

		{
			var consequent = ($$anchor) => {
				var span = root();
				var node_3 = $.child(span);

				LinkIcon(node_3, {});
				$.reset(span);
				$.append($$anchor, span);
			};

			$.if(node_2, ($$render) => {
				if ($.get(isUrlOrPath)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}