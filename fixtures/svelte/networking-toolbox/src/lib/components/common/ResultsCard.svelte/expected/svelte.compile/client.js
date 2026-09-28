import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<button class="copy-btn"><span><!></span> </button>`);
var root_1 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3> </h3> <!></div> <div class="card-content"><!></div></div>`);

export default function ResultsCard($$anchor, $$props) {
	let copied = $.prop($$props, 'copied', 3, false),
		copyText = $.prop($$props, 'copyText', 3, 'Copy Results'),
		copiedText = $.prop($$props, 'copiedText', 3, 'Copied!'),
		showCopyButton = $.prop($$props, 'showCopyButton', 3, true);

	var div = root_1();
	var div_1 = $.child(div);
	var h3 = $.child(div_1);
	var text = $.only_child(h3, true);
	var node = $.sibling(h3, 2);

	{
		var consequent = ($$anchor) => {
			var button = root();
			var span = $.child(button);
			var node_1 = $.child(span);

			{
				let $0 = $.derived(() => copied() ? 'check' : 'copy');

				Icon(node_1, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			$.reset(span);

			var text_1 = $.sibling(span);

			$.reset(button);

			$.template_effect(() => {
				button.disabled = copied();
				$.set_class(span, 1, $.clsx(copied() ? 'text-green-500' : ''));
				$.set_text(text_1, ` ${(copied() ? copiedText() : copyText()) ?? ''}`);
			});

			$.delegated('click', button, function (...$$args) {
				$$props.onCopy?.apply(this, $$args);
			});

			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if (showCopyButton() && $$props.onCopy) $$render(consequent);
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	$.snippet(node_2, () => $$props.children);
	$.reset(div_2);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $$props.title));
	$.append($$anchor, div);
}

$.delegate(['click']);