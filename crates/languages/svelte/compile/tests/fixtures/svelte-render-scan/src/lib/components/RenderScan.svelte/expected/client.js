import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Eye from '$lib/components/Logo.svelte';
import RenderScanObserver from './RenderScanObserver.svelte';
import { onMount } from 'svelte';

var root = $.from_html(`<button class="svelte-4esu0v"><div><!></div></button>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function RenderScan($$anchor, $$props) {
	$.push($$props, true);

	// Props with defaults
	let initialEnabled = $.prop($$props, 'initialEnabled', 3, true),
		offsetLeft = $.prop($$props, 'offsetLeft', 3, 0),
		hideIcon = $.prop($$props, 'hideIcon', 3, false),
		callback = $.prop($$props, 'callback', 3, undefined),
		duration = $.prop($$props, 'duration', 3, 1000);

	// State management
	let enabled = $.state($.proxy(initialEnabled()));

	// Fixed colors for enabled/disabled states
	const enabledColor = '#2189b5';

	const disabledColor = '#9ca3af';

	// Load saved state from localStorage on mount
	onMount(() => {
		const savedState = localStorage.getItem('svelte-render-scan-enabled');

		if (savedState !== null) {
			$.set(enabled, savedState === 'true');
		}
	});

	// Toggle handler that also saves to localStorage
	function toggleEnabled() {
		$.set(enabled, !$.get(enabled));
		localStorage.setItem('svelte-render-scan-enabled', $.get(enabled).toString());
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			RenderScanObserver($$anchor, {
				get callback() {
					return callback();
				},

				get duration() {
					return duration();
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(enabled)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var button = root();
			let styles;
			var div = $.child(button);
			let classes;
			var node_2 = $.child(div);

			Eye(node_2, { color: 'white', size: 24 });
			$.reset(div);
			$.reset(button);

			$.template_effect(() => {
				$.set_attribute(button, 'title', $.get(enabled) ? 'Disable render scanning' : 'Enable render scanning');

				styles = $.set_style(button, '', styles, {
					'background-color': $.get(enabled) ? enabledColor : disabledColor,
					right: `calc(1rem + ${offsetLeft()}px)`
				});

				classes = $.set_class(div, 1, 'svelte-4esu0v', null, classes, { enabled: $.get(enabled) });
			});

			$.delegated('click', button, toggleEnabled);
			$.append($$anchor, button);
		};

		$.if(node_1, ($$render) => {
			if (!hideIcon()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);