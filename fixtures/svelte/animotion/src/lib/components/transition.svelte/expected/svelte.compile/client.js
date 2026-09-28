import 'svelte/internal/disclose-version';
import { browser } from '$app/environment';
import * as $ from 'svelte/internal/client';
import Transition from '$lib/components/transition.svelte';

let customViewTransitions = $.state(void 0);

if (browser) {
	const style = document.createElement('style');

	style.dataset.id = 'view-transitions';
	document.head.appendChild(style);
	$.set(customViewTransitions, style, true);
}

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'order',
	'stepDuration',
	'name',
	'visible',
	'transitions',
	'hidden',
	'entry',
	'exit',
	'duration',
	'delay'
]);

var root = $.from_html(`<div><!></div>`);

export default function Transition_1($$anchor, $$props) {
	$.push($$props, true);

	const noop = () => {};

	let visible = $.prop($$props, 'visible', 3, false),
		props = $.rest_props($$props, rest_excludes);

	let el = $.state(void 0);

	let viewTransitionName = $.derived(() => $$props.name
		? `transition-${$$props.name}`
		: `transition-${crypto.randomUUID()}`);

	function viewTransition(fn) {
		if (!document.startViewTransition) {
			console.warn('The View Transitions API is not supported by your browser');
			fn();

			return;
		}

		document.startViewTransition(fn);
	}

	/**
	 * Transition elements are hidden so we can animate the change in position
	 * otherwise the layout would never change if they're already in the DOM
	 * so this checks for fragments that aren't visible and hides them.
	 */
	function prepareTransition() {
		const currentSlide = $.get(el)?.closest('section');

		currentSlide.querySelectorAll('.fragment').forEach((fragment) => {
			if (!fragment.classList.contains('visible')) {
				fragment.classList.add('hidden');
			}
		});
	}

	function enterTransition() {
		prepareTransition();

		viewTransition(() => {
			$$props?.do?.() ?? noop();
			$.get(el)?.classList.remove('hidden');
		});
	}

	function leaveTransition() {
		prepareTransition();

		viewTransition(() => {
			$$props?.undo?.() ?? noop();
		});
	}

	$.user_effect(() => {
		if (!$.get(el)) return;

		$.get(el).addEventListener('current', enterTransition);
		$.get(el).addEventListener('out', leaveTransition);

		return () => {
			$.get(el)?.removeEventListener('current', enterTransition);
			$.get(el)?.removeEventListener('out', leaveTransition);
		};
	});

	$.user_effect(() => {
		if (!$.get(customViewTransitions)) return;

		if ($$props.entry || $$props.exit) {
			let transitions = '';

			if ($$props.entry) {
				transitions += `
					::view-transition-new(${$.get(viewTransitionName)}):only-child {
						${$$props.duration
					? `--view-transition-duration: ${$$props.duration}s;`
					: ''}
						animation: ${$$props.entry} var(--view-transition-duration) var(--ease);
						animation-delay: ${$$props.delay ?? 0}s;
						animation-fill-mode: both;
					}
				`;
			}

			if ($$props.exit) {
				transitions += `
					::view-transition-old(${$.get(viewTransitionName)}):only-child {
						${$$props.duration
					? `--view-transition-duration: ${$$props.duration}s;`
					: ''}
						animation: ${$$props.exit} var(--view-transition-duration) var(--ease);
						animation-delay: ${$$props.delay ?? 0}s;
						animation-fill-mode: both;
					}
				`;
			}

			$.get(customViewTransitions).textContent += transitions;
		}
	});

	var fragment_1 = $.comment();
	var node = $.first_child(fragment_1);

	{
		var consequent = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_1 = $.first_child(fragment_2);

			$.each(node_1, 17, () => $$props.transitions, $.index, ($$anchor, transition, i) => {
				const previousTransition = $.derived(() => i === 0 ? noop : $$props.transitions[i - 1]);

				Transition($$anchor, {
					get do() {
						return $.get(transition);
					},

					get undo() {
						return $.get(previousTransition);
					}
				});
			});

			$.append($$anchor, fragment_2);
		};

		var alternate = ($$anchor) => {
			var div = root();
			let classes;
			let styles;
			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(div);
			$.bind_this(div, ($$value) => $.set(el, $$value), () => $.get(el));

			$.template_effect(() => {
				classes = $.set_class(
					div,
					1,
					$.clsx([
						{ hidden: !visible(), ignore: $$props.hidden },
						$$props.class
					]),
					'svelte-1oofcvt',
					classes,
					{ fragment: !visible() }
				);

				$.set_attribute(div, 'data-fragment-index', $$props.order);
				$.set_attribute(div, 'data-autoslide', $$props.stepDuration);
				styles = $.set_style(div, $$props.style, styles, { 'view-transition-name': $.get(viewTransitionName) });
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.transitions) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}