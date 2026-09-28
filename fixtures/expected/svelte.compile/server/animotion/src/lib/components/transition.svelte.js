import * as $ from 'svelte/internal/server';
import Transition from '$lib/components/transition.svelte';
import { browser } from '$app/environment';

let customViewTransitions = void 0;

if (browser) {
	const style = document.createElement('style');

	style.dataset.id = 'view-transitions';
	document.head.appendChild(style);
	customViewTransitions = style;
}

export default function Transition_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const noop = () => {};

		let {
			children,
			order,
			stepDuration,
			name,
			visible = false,
			transitions,
			hidden,
			entry,
			exit,
			duration,
			delay,
			$$slots,
			$$events,
			...props
		} = $$props;

		let el = void 0;

		let viewTransitionName = $.derived(() => name
			? `transition-${name}`
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
			const currentSlide = el?.closest('section');

			currentSlide.querySelectorAll('.fragment').forEach((fragment) => {
				if (!fragment.classList.contains('visible')) {
					fragment.classList.add('hidden');
				}
			});
		}

		function enterTransition() {
			prepareTransition();

			viewTransition(() => {
				props?.do?.() ?? noop();
				el?.classList.remove('hidden');
			});
		}

		function leaveTransition() {
			prepareTransition();

			viewTransition(() => {
				props?.undo?.() ?? noop();
			});
		}

		if (transitions) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(transitions);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let transition = each_array[i];
				const previousTransition = i === 0 ? noop : transitions[i - 1];

				Transition($$renderer, { do: transition, undo: previousTransition });
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx([{ hidden: !visible, ignore: hidden }, props.class]), 'svelte-1oofcvt', { 'fragment': !visible })}${$.attr('data-fragment-index', order)}${$.attr('data-autoslide', stepDuration)}${$.attr_style(props.style, { 'view-transition-name': viewTransitionName() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}