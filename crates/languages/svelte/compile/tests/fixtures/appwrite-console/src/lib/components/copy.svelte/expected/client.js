import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { copy } from '$lib/helpers/copy';
import { clickOnEnter } from '$lib/helpers/a11y';
import { Tooltip } from '@appwrite.io/pink-svelte';
import { trackEvent } from '$lib/actions/analytics';
import { addNotification } from '$lib/stores/notifications';

var root = $.from_html(`<span data-private="" role="button" tabindex="0"><!></span>`);
var root_1 = $.from_html(`<p slot="tooltip"><!></p>`);

export default function Copy($$anchor, $$props) {
	$.push($$props, true);

	let event = $.prop($$props, 'event', 3, null),
		eventContext = $.prop($$props, 'eventContext', 3, 'click_id_tag'),
		tooltipDisabled = $.prop($$props, 'tooltipDisabled', 3, false),
		tooltipPortal = $.prop($$props, 'tooltipPortal', 3, false),
		tooltipDelay = $.prop($$props, 'tooltipDelay', 3, 0),
		tooltipPlacement = $.prop($$props, 'tooltipPlacement', 3, undefined),
		copyText = $.prop($$props, 'copyText', 3, 'Click to copy');

	let content = $.state($.proxy(copyText()));

	async function handleClick() {
		const success = await copy($$props.value);

		if (success) {
			$.set(content, 'Copied');
		} else {
			addNotification({ message: 'Unable to copy to clipboard', type: 'error' });
		}

		if (event()) {
			trackEvent(eventContext(), { name: event() });
		}
	}

	//TODO: remove this component
	Tooltip($$anchor, {
		get disabled() {
			return tooltipDisabled();
		},

		get portal() {
			return tooltipPortal();
		},

		get delay() {
			return tooltipDelay();
		},
		maxWidth: '500px',
		get placement() {
			return tooltipPlacement();
		},

		children: ($$anchor, $$slotProps) => {
			var span = root();

			$.set_style(span, '', {}, { display: 'inline-flex', cursor: 'pointer' });

			var node = $.child(span);

			$.snippet(node, () => $$props.children ?? $.noop);
			$.reset(span);

			$.delegated('click', span, (event) => {
				event.preventDefault();
				event.stopPropagation();
				handleClick();
			});

			$.delegated('keyup', span, function (...$$args) {
				clickOnEnter?.apply(this, $$args);
			});

			$.event('mouseenter', span, () => setTimeout(() => $.set(content, copyText())));
			$.append($$anchor, span);
		},

		$$slots: {
			default: true,
			tooltip: ($$anchor, $$slotProps) => {
				const showing = $.derived(() => $$slotProps.showing);
				var p = root_1();
				var node_1 = $.child(p);

				{
					var consequent = ($$anchor) => {
						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(content)));
						$.append($$anchor, text);
					};

					$.if(node_1, ($$render) => {
						if ($.get(showing)) $$render(consequent);
					});
				}

				$.reset(p);
				$.append($$anchor, p);
			}
		}
	});

	$.pop();
}

$.delegate(['click', 'keyup']);