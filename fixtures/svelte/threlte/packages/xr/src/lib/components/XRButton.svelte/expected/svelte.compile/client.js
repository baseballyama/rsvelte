import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getXRSupportState } from '../lib/getXRSupportState.js';
import { toggleXRSession } from '../lib/toggleXRSession.js';
import { isPresenting, xr } from '../internal/state.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'mode',
	'sessionInit',
	'force',
	'styled',
	'onclick',
	'onerror',
	'children'
]);

var root = $.from_html(`<button><!></button>`);

export default function XRButton($$anchor, $$props) {
	$.push($$props, true);

	/** The type of `XRSession` to create */
	/**
	 * `XRSession` configuration options
	 * @see https://immersive-web.github.io/webxr/#feature-dependencies
	 */
	/** Whether this button should only enter / exit an `XRSession`. Default is to toggle both ways */
	/** Whether to apply automatic styling to the button. Set false to apply custom styles. Default is true. */
	let styled = $.prop($$props, 'styled', 3, true),
		props = $.rest_props($$props, rest_excludes);

	const handleButtonClick = async (nativeEvent, state) => {
		if (!xr.current) {
			throw new Error('The <XR> component was not created. This is required to start an XR session.');
		}

		$$props.onclick?.({ state, nativeEvent });

		if (state !== 'supported') return;

		try {
			await toggleXRSession($$props.mode, $$props.sessionInit, $$props.force);
		} catch(error) {
			/** This callback gets fired if XR initialization fails. */
			$$props.onerror?.(error);
		}
	};

	const modeText = $.derived(() => ({ 'immersive-vr': 'VR', 'immersive-ar': 'AR', inline: 'inline' })[$$props.mode]);

	const style = $.derived(() => styled()
		? `
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      border: 1px solid white;
      background: rgba(0, 0, 0, 0.1);
      color: white;
      outline: none;
      z-index: 10;
      ${$$props.style ?? ''}
    `
		: $$props.style);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => getXRSupportState($$props.mode), null, ($$anchor, state) => {
		var button = root();

		var event_handler = (event) => {
			handleButtonClick(event, $.get(state));
		};

		$.attribute_effect(button, () => ({ onclick: event_handler, ...props, style: $.get(style) }));

		var node_1 = $.child(button);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.snippet(node_2, () => $$props.children, () => ({ state: $.get(state) }));
				$.append($$anchor, fragment_1);
			};

			var consequent_1 = ($$anchor) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, `${$.get(modeText) ?? ''} unsupported`));
				$.append($$anchor, text);
			};

			var consequent_2 = ($$anchor) => {
				var text_1 = $.text('HTTPS needed');

				$.append($$anchor, text_1);
			};

			var consequent_3 = ($$anchor) => {
				var text_2 = $.text();

				$.template_effect(() => $.set_text(text_2, `${$.get(modeText) ?? ''} blocked`));
				$.append($$anchor, text_2);
			};

			var consequent_4 = ($$anchor) => {
				var text_3 = $.text();

				$.template_effect(() => $.set_text(text_3, `${isPresenting.current ? 'Exit' : 'Enter'} ${$.get(modeText) ?? ''}`));
				$.append($$anchor, text_3);
			};

			$.if(node_1, ($$render) => {
				if ($$props.children) $$render(consequent); else if ($.get(state) === 'unsupported') $$render(consequent_1, 1); else if ($.get(state) === 'insecure') $$render(consequent_2, 2); else if ($.get(state) === 'blocked') $$render(consequent_3, 3); else if ($.get(state) === 'supported') $$render(consequent_4, 4);
			});
		}

		$.reset(button);
		$.append($$anchor, button);
	});

	$.append($$anchor, fragment);
	$.pop();
}