import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import TargetingClasses from './_TargetingClasses.svelte';
import EventsAndModifiers from './_EventsAndModifiers.svelte';
import InnerElementProps from './_InnerElementProps.svelte';

var root = $.from_html(
	`Because Svelte limits your CSS to <em>only</em> the current component, you need
      to use a ":global" selector to target SMUI elements.`,
	1
);

var root_1 = $.from_html(
	`SMUI supports listening to <strong>all</strong> events. You can also add modifiers
      from the @smui/common/events endpoint.`,
	1
);

var root_2 = $.from_html(`<section><h2>Quick Guide</h2> <p>Some helpful guides for common use patterns in SMUI that are different than
    standard Svelte.</p> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root_2();

	$.head('1ez5l9p', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Quick Guide - SMUI';
		});
	});

	var node = $.sibling($.child(section), 4);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var fragment = root();

			$.next(2);
			$.append($$anchor, fragment);
		};

		Demo(node, {
			get component() {
				return TargetingClasses;
			},
			file: 'quick-guide/_TargetingClasses.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Targeting Classes');

				$.append($$anchor, text);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var fragment_1 = root_1();

			$.next(2);
			$.append($$anchor, fragment_1);
		};

		Demo(node_1, {
			get component() {
				return EventsAndModifiers;
			},
			file: 'quick-guide/_EventsAndModifiers.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Events and Modifiers');

				$.append($$anchor, text_1);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_2 = $.text('Many SMUI components have inner elements that can take props with a\n      prefix, like "input$" or "icon$".');

			$.append($$anchor, text_2);
		};

		Demo(node_2, {
			get component() {
				return InnerElementProps;
			},
			file: 'quick-guide/_InnerElementProps.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text('Inner element props');

				$.append($$anchor, text_3);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.reset(section);
	$.append($$anchor, section);
}