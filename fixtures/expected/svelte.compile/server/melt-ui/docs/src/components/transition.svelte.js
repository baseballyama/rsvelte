import * as $ from 'svelte/internal/server';
import { getContext, setContext, tick } from "svelte";
import { watch } from "runed";

const CTX_KEY = Symbol("transition");

const ctx = {
	get() {
		return getContext(CTX_KEY);
	},

	set(context) {
		return setContext(CTX_KEY, context);
	}
};

class Context {
	// Observable state for child transitions
	show = null;

	applyImmediately;

	// number of child transitions that need to be waited before completed
	count;

	// method to communicate child transition completion
	completed = () => {};

	constructor(config) {
		this.applyImmediately = config.applyImmediately ?? false;
		this.count = config.count ?? 0;
		this.completed = config.completed ?? (() => {});
	}
}

export default function Transition($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// convert a string of class names into an array, for use with DOM methods
		function classes(classes) {
			return classes ? classes.split(" ").filter((x) => x) : [];
		}

		// to wait until css changes have been appplied we use a double rAF
		function nextFrame() {
			const raf = requestAnimationFrame; // help minification

			return new Promise((resolve) => raf(() => raf(resolve)));
		}

		const {
			show = null,
			applyImmediately,
			unmount,
			enter = "",
			enterFrom = "",
			enterTo = "",
			leave = "",
			leaveFrom = "",
			leaveTo = "",
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		// convert class strings to arrays, for easier use with DOM elements
		const enterClasses = $.derived(() => classes(enter));

		const enterFromClasses = $.derived(() => classes(enterFrom));
		const enterToClasses = $.derived(() => classes(enterTo));

		// if leave, leaveFrom, or leaveTo are not specified then use enter values
		// as a convenient way to avoid repeating definitions (but reverse To & From)
		const leaveClasses = $.derived(() => classes(leave === null ? enter : leave));

		const leaveFromClasses = $.derived(() => classes(leaveFrom === null ? enterTo : leaveFrom));
		const leaveToClasses = $.derived(() => classes(leaveTo === null ? enterFrom : leaveTo));

		// get parent context if we're a child
		const parent = show === null ? ctx.get() : null;

		// create our own context (which will also become parent for any children)
		const context = new Context({
			applyImmediately: parent ? parent.applyImmediately : applyImmediately,
			count: 0,
			completed: () => {}
		});

		// set context for children to use
		setContext(CTX_KEY, context);

		// set initial state
		let display = show && !context.applyImmediately ? "contents" : "none";

		let mounted = !unmount || show === true;

		// use action that hooks into our wrapper div and manages everything
		function transition(node, show) {
			// the child element that we will be applying classes to
			// set later once the component has mounted
			let el;

			function addClasses(...classes) {
				el.classList.add(...classes);
			}

			function removeClasses(...classes) {
				el.classList.remove(...classes);
			}

			function transitionEnd(transitions) {
				// return a promise that transitions are complete (resolve immediately if no transitions)
				return transitions.length
					? new Promise((resolve) => el.addEventListener(
						"transitionend",
						(e) => {
							e.stopPropagation();
							resolve();
						},
						{ once: true }
					))
					: Promise.resolve();
			}

			function childrenCompleted(parentCompleted) {
				// return a promise that all children have completed (resolve immediately if no children)
				// sets the context completed method that children call to a promise that the parent has completed
				return context.count
					? new Promise((resolve) => {
						let count = 0;

						context.completed = () => {
							if (++count === context.count) {
								resolve();
							}

							return parentCompleted;
						};
					})
					: Promise.resolve();
			}

			async function ensureMountedElement() {
				if (unmount && !mounted) {
					mounted = true;
					await tick(); // give slot chance to render
				}

				return node.firstElementChild;
			}

			async function apply(show, base, from, to) {
				el = await ensureMountedElement();

				let resolveCompleted = () => {};

				const completed = new Promise((resolve) => {
					resolveCompleted = resolve;
				});

				const children = childrenCompleted(completed);

				// set state for any child transitions
				context.show = show;

				addClasses(...base, ...from);

				const transitioned = transitionEnd(base);

				await nextFrame();
				removeClasses(...from);
				addClasses(...to);
				await Promise.all([transitioned, children]);

				if (parent) {
					await parent.completed();
				}

				removeClasses(...base, ...to);
				resolveCompleted();
			}

			async function enter() {
				rest.beforeEnter?.();
				display = "contents";
				await apply(true, enterClasses(), enterFromClasses(), enterToClasses());
				rest.afterEnter?.();
			}

			async function leave() {
				rest.beforeLeave?.();
				await apply(false, leaveClasses(), leaveFromClasses(), leaveToClasses());
				display = "none";

				if (unmount) {
					mounted = false;
				}

				rest.afterLeave?.();
			}

			// execute is always called, even for the initial render, so we use a flag
			// to prevent a transition running unless applyImmediately is set for animating in
			let shouldRun = context.applyImmediately;

			// temp fix for Svelte 5 issue #11448
			let showPrev;

			function execute(show) {
				// temp fix for Svelte 5 issue #11448 triggering animations when prop hasn't changed
				if (show === showPrev) {
					return;
				}

				showPrev = show;

				// run appropriate transition, set promise for completion
				function getExecuting() {
					if (shouldRun) {
						return show ? executing.then(enter) : executing.then(leave);
					}

					return Promise.resolve();
				}

				executing = getExecuting();

				// play transitions on all subsequent calls ...
				shouldRun = true;
			}

			// to wait for in-progress transitions to complete
			let executing = Promise.resolve();

			// if we're a child transition, increment the count on the parent and listen for state notifications
			if (parent) {
				parent.count++;

				// child updates happen here, as show propery is updated by the parent, which triggers the transition
				watch(() => parent.show, execute);
			} else {
				// otherwise, first run through to set initial state (and possibly, 'applyImmediately' transition)
				execute(show);
			}

			return {
				update(show) {
					// top-level updates happen here, as show property is updated, which triggers the transition
					execute(show);
				},

				destroy() {
					// if we're a child and being removed, notify our parent and stop listening for updates
					if (parent) {
						parent.count--;
					}
				}
			};
		}

		$$renderer.push(`<div${$.attr_style('', { display })}>`);

		if (mounted) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}