import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import TargetingClasses from './_TargetingClasses.svelte';
import EventsAndModifiers from './_EventsAndModifiers.svelte';
import InnerElementProps from './_InnerElementProps.svelte';

export default function _page($$renderer) {
	$.head('1ez5l9p', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Quick Guide - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Quick Guide</h2> <p>Some helpful guides for common use patterns in SMUI that are different than
    standard Svelte.</p> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Because Svelte limits your CSS to <em>only</em> the current component, you need
      to use a ":global" selector to target SMUI elements.`);
		}

		Demo($$renderer, {
			component: TargetingClasses,
			file: 'quick-guide/_TargetingClasses.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Targeting Classes`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->SMUI supports listening to <strong>all</strong> events. You can also add modifiers
      from the @smui/common/events endpoint.`);
		}

		Demo($$renderer, {
			component: EventsAndModifiers,
			file: 'quick-guide/_EventsAndModifiers.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Events and Modifiers`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Many SMUI components have inner elements that can take props with a
      prefix, like "input$" or "icon$".`);
		}

		Demo($$renderer, {
			component: InnerElementProps,
			file: 'quick-guide/_InnerElementProps.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Inner element props`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----></section>`);
}