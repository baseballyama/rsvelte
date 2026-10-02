import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(
	`Build a class string from a map of class names to conditions. This is
      useful when you need to add classes to a component, since Svelte's
      "class:" directives don't work on components. (It's also useful for
      actions that take <code>addClass</code> and <code>removeClass</code> functions.)`,
	1
);

var root_1 = $.from_html(
	`Dispatch a custom event. This differs from Svelte's component event
      system, because these events require a DOM element as a target, can bubble
      (and do by default), and are cancelable with <code>event.preventDefault()</code>. All SMUI events are dispatched with this.`,
	1
);

var root_2 = $.from_html(
	`Exclude differs from normal <code>omit</code> functions by also excluding all
      properties that begin with a given string if that string ends with "$". Prefix
      Filter filters an object for only properties with a certain prefix. They are
      usually used together to allow props to be given to multiple elements within
      a component.`,
	1
);

var root_3 = $.from_html(`<section><h2>Common</h2> <p>A common Label and Icon, helper utilities, elemental components, and
    styling.</p> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/common</pre> <h5>Demos</h5> <!> <!> <!> <h4>Helper Utilities</h4> <!> <!> <!> <!> <!> <h4>Other Components</h4> <!></section>`);

export default function _page($$anchor) {
	var section = root_3();

	$.head('2s4eaw', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Common - SMUI';
		});
	});

	var node = $.sibling($.child(section), 10);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text = $.text('The common label and icon are also exported from each package that uses\n      them.');

			$.append($$anchor, text);
		};

		Demo(node, {
			get component() {
				return CommonLabelIcon;
			},
			file: 'common/_CommonLabelIcon.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Common Label and Icon');

				$.append($$anchor, text_1);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_2 = $.text('Many SMUI components let you customize which DOM element is used to render\n      them. This is done with the SmuiElement component.');

			$.append($$anchor, text_2);
		};

		Demo(node_1, {
			get component() {
				return SmuiElement;
			},
			file: 'common/_SmuiElement.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text('SmuiElement Component');

				$.append($$anchor, text_3);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_4 = $.text('In the SMUI components that let you customize which DOM element is used to\n      render them, you can use the "svg" tag to render an SVG.');

			$.append($$anchor, text_4);
		};

		Demo(node_2, {
			get component() {
				return Svg;
			},
			file: 'common/_Svg.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_5 = $.text('Svg Elements');

				$.append($$anchor, text_5);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_3 = $.sibling(node_2, 4);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var fragment = root();

			$.next(4);
			$.append($$anchor, fragment);
		};

		Demo(node_3, {
			get component() {
				return ClassMap;
			},
			file: 'common/_ClassMap.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_6 = $.text('Class Map');

				$.append($$anchor, text_6);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var fragment_1 = root_1();

			$.next(2);
			$.append($$anchor, fragment_1);
		};

		Demo(node_4, {
			get component() {
				return Dispatch;
			},
			file: 'common/_Dispatch.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_7 = $.text('Dispatch');

				$.append($$anchor, text_7);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var fragment_2 = root_2();

			$.next(2);
			$.append($$anchor, fragment_2);
		};

		Demo(node_5, {
			get component() {
				return ExcludeAndPrefixFilter;
			},

			files: [
				'common/_ExcludeAndPrefixFilter.svelte',
				'common/_ExcludeAndPrefixFilterComponent.svelte'
			],
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_8 = $.text('Exclude and Prefix Filter');

				$.append($$anchor, text_8);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_9 = $.text('An action that takes actions and runs them on the element. Used to allow\n      actions on components, and forward actions from one component to another,\n      until the ultimate component finally renders the DOM element.');

			$.append($$anchor, text_9);
		};

		Demo(node_6, {
			get component() {
				return UseActions;
			},

			files: [
				'common/_UseActions.svelte',
				'common/_UseActionsComponent.svelte',
				'common/_UseActionsPannable.ts',
				'common/_UseActionsSwipeable.ts',
				'common/_UseActionsTappable.ts'
			],
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_10 = $.text('Use Actions');

				$.append($$anchor, text_10);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_7 = $.sibling(node_6, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_11 = $.text('A function that announces a string of text to users who are using a screen\n      reader.');

			$.append($$anchor, text_11);
		};

		Demo(node_7, {
			get component() {
				return Announce;
			},
			file: 'common/_Announce.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_12 = $.text('Announce');

				$.append($$anchor, text_12);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_8 = $.sibling(node_7, 4);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_13 = $.text('Use this to make a ClassAdder component.');

			$.append($$anchor, text_13);
		};

		Demo(node_8, {
			get component() {
				return ClassAdder;
			},

			files: [
				'common/_ClassAdder.svelte',
				'common/_ClassAdderComponent.ts'
			],
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_14 = $.text('Class Adder');

				$.append($$anchor, text_14);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.reset(section);
	$.append($$anchor, section);
}