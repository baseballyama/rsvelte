import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import CommonLabelIcon from './_CommonLabelIcon.svelte';
import SmuiElement from './_SmuiElement.svelte';
import Svg from './_Svg.svelte';
import ClassMap from './_ClassMap.svelte';
import Dispatch from './_Dispatch.svelte';
import ExcludeAndPrefixFilter from './_ExcludeAndPrefixFilter.svelte';
import UseActions from './_UseActions.svelte';
import Announce from './_Announce.svelte';
import ClassAdder from './_ClassAdder.svelte';

export default function _page($$renderer) {
	$.head('2s4eaw', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Common - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Common</h2> <p>A common Label and Icon, helper utilities, elemental components, and
    styling.</p> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/common</pre> <h5>Demos</h5> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->The common label and icon are also exported from each package that uses
      them.`);
		}

		Demo($$renderer, {
			component: CommonLabelIcon,
			file: 'common/_CommonLabelIcon.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Common Label and Icon`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Many SMUI components let you customize which DOM element is used to render
      them. This is done with the SmuiElement component.`);
		}

		Demo($$renderer, {
			component: SmuiElement,
			file: 'common/_SmuiElement.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->SmuiElement Component`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->In the SMUI components that let you customize which DOM element is used to
      render them, you can use the "svg" tag to render an SVG.`);
		}

		Demo($$renderer, {
			component: Svg,
			file: 'common/_Svg.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Svg Elements`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> <h4>Helper Utilities</h4> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Build a class string from a map of class names to conditions. This is
      useful when you need to add classes to a component, since Svelte's
      "class:" directives don't work on components. (It's also useful for
      actions that take <code>addClass</code> and <code>removeClass</code> functions.)`);
		}

		Demo($$renderer, {
			component: ClassMap,
			file: 'common/_ClassMap.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Class Map`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Dispatch a custom event. This differs from Svelte's component event
      system, because these events require a DOM element as a target, can bubble
      (and do by default), and are cancelable with <code>event.preventDefault()</code>. All SMUI events are dispatched with this.`);
		}

		Demo($$renderer, {
			component: Dispatch,
			file: 'common/_Dispatch.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Dispatch`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Exclude differs from normal <code>omit</code> functions by also excluding all
      properties that begin with a given string if that string ends with "$". Prefix
      Filter filters an object for only properties with a certain prefix. They are
      usually used together to allow props to be given to multiple elements within
      a component.`);
		}

		Demo($$renderer, {
			component: ExcludeAndPrefixFilter,
			files: [
				'common/_ExcludeAndPrefixFilter.svelte',
				'common/_ExcludeAndPrefixFilterComponent.svelte'
			],
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Exclude and Prefix Filter`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->An action that takes actions and runs them on the element. Used to allow
      actions on components, and forward actions from one component to another,
      until the ultimate component finally renders the DOM element.`);
		}

		Demo($$renderer, {
			component: UseActions,
			files: [
				'common/_UseActions.svelte',
				'common/_UseActionsComponent.svelte',
				'common/_UseActionsPannable.ts',
				'common/_UseActionsSwipeable.ts',
				'common/_UseActionsTappable.ts'
			],
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Use Actions`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->A function that announces a string of text to users who are using a screen
      reader.`);
		}

		Demo($$renderer, {
			component: Announce,
			file: 'common/_Announce.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Announce`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> <h4>Other Components</h4> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Use this to make a ClassAdder component.`);
		}

		Demo($$renderer, {
			component: ClassAdder,
			files: [
				'common/_ClassAdder.svelte',
				'common/_ClassAdderComponent.ts'
			],
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Class Adder`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----></section>`);
}