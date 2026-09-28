import * as $ from 'svelte/internal/server';
import { parse } from 'regexparam';
import { tick, untrack } from 'svelte';

class RouterStateImpl {
	/** The current full location (incl. querystring) */
	_loc = getLocation();

	#_location = $.derived((/** The current location (excluding querystring) */
	) => this._loc.location);

	get _location() {
		return this.#_location();
	}

	set _location($$value) {
		return this.#_location($$value);
	}

	#_querystring = $.derived(() => this._loc.querystring);

	get _querystring() {
		return this.#_querystring();
	}

	set _querystring($$value) {
		return this.#_querystring($$value);
	}

	_params = undefined;

	get loc() {
		return this._loc;
	}

	/** The current location (excluding querystring) */
	get location() {
		return this._location;
	}

	/** The current querystring */
	get querystring() {
		return this._querystring;
	}

	get params() {
		return this._params;
	}

	constructor() {
		if (typeof window !== 'undefined') {
			window.addEventListener('hashchange', () => {
				this._loc = getLocation();
			});
		} else {
			// eslint-disable-next-line no-console
			console.warn("[svelte-spa-router] window 'window' is not defined, skipping initiation");
		}
	}
}

/** Router state object, containing the current location, querystring and params. */
export const router = new RouterStateImpl();

/** Returns the current location from the hash. */
function getLocation() {
	const currentHref = typeof window !== 'undefined' ? window.location.href : '';
	const hashPosition = currentHref.indexOf('#/');
	let location = hashPosition > -1 ? currentHref.substr(hashPosition + 1) : '/';

	// Check if there's a querystring
	const qsPosition = location.indexOf('?');

	let querystring = '';

	if (qsPosition > -1) {
		querystring = location.substr(qsPosition + 1);
		location = location.substr(0, qsPosition);
	}

	return { location, querystring };
}

/**
 * Navigates to a new page programmatically.
 *
 * @param location - Path to navigate to (must start with `/` or `#/`)
 * @returns Promise that resolves after the page navigation has completed
 */
export async function push(location) {
	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
		throw Error('Invalid parameter location');
	}

	// Execute this code when the current call stack is complete
	await tick();

	// Note: this will include scroll state in history even when restoreScrollState is false
	history.replaceState(
		{
			...history.state,
			__svelte_spa_router_scrollX: window.scrollX,
			__svelte_spa_router_scrollY: window.scrollY
		},
		''
	);

	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
}

/**
 * Navigates back in history (equivalent to pressing the browser's back button).
 *
 * @returns Promise that resolves after the page navigation has completed
 */
export async function pop() {
	// Execute this code when the current call stack is complete
	await tick();

	window.history.back();
}

/**
 * Replaces the current page but without modifying the history stack.
 *
 * @param location - Path to navigate to (must start with `/` or `#/`)
 * @returns Promise that resolves after the page navigation has completed
 */
export async function replace(location) {
	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
		throw Error('Invalid parameter location');
	}

	// Execute this code when the current call stack is complete
	await tick();

	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

	try {
		const newState = { ...history.state };

		delete newState['__svelte_spa_router_scrollX'];
		delete newState['__svelte_spa_router_scrollY'];
		window.history.replaceState(newState, '', dest);
	} catch {
		// eslint-disable-next-line no-console
		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
	}

	// The method above doesn't trigger the hashchange event, so let's do that manually
	window.dispatchEvent(new Event('hashchange'));
}

/**
 * Svelte Action that enables a link element (`<a>`) to use our history management.
 *
 * For example:
 *
 * ```html
 * <a href="/books" use:link>View books</a>
 * ```
 */
export function link(node, opts) {
	let currentOpts = linkOpts(opts);

	// Only apply to <a> tags
	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
		throw Error('Action "link" can only be used with <a> tags');
	}

	// Set initial href
	updateLinkHref(node, currentOpts);

	// Add click handler once, using currentOpts reference
	const clickHandler = (event) => {
		event.preventDefault();

		if (!currentOpts.disabled) {
			const target = event.currentTarget;
			const href = target ? target.getAttribute('href') : null;

			if (href) {
				scrollstateHistoryHandler(href);
			}
		}
	};

	node.addEventListener('click', clickHandler);

	return {
		update(updated) {
			currentOpts = linkOpts(updated);
			updateLinkHref(node, currentOpts);
		},

		destroy() {
			node.removeEventListener('click', clickHandler);
		}
	};
}

/** Tries to restore the scroll state from the given history state. */
export function restoreScroll(state) {
	// If this exists, then this is a back navigation: restore the scroll position
	if (state) {
		window.scrollTo(state.__svelte_spa_router_scrollX || 0, state.__svelte_spa_router_scrollY || 0);
	} else {
		// Otherwise this is a forward navigation: scroll to top
		window.scrollTo(0, 0);
	}
}

// Internal function used by the link function to update href attribute
function updateLinkHref(node, opts) {
	let href = opts.href || node.getAttribute('href');

	// Destination must start with '/' or '#/'
	if (href && href.charAt(0) == '/') {
		// Add # to the href attribute
		href = '#' + href;
	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
		throw Error('Invalid value for "href" attribute: ' + href);
	}

	node.setAttribute('href', href);
}

// Internal function that ensures the argument of the link action is always an object
function linkOpts(val) {
	if (typeof val == 'string') {
		return { href: val };
	}

	return val || {};
}

/**
 * The handler attached to an anchor tag responsible for updating the
 * current history state with the current scroll state.
 */
function scrollstateHistoryHandler(href) {
	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
	history.replaceState(
		{
			...history.state,
			__svelte_spa_router_scrollX: window.scrollX,
			__svelte_spa_router_scrollY: window.scrollY
		},
		''
	);

	// This will force an update as desired, but this time our scroll state will be attached
	window.location.hash = href;
}

export default function Router($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			routes = {},
			prefix = '',
			restoreScrollState = false,
			onConditionsFailed = () => {},
			onRouteLoaded = () => {},
			onRouteLoading = () => {},
			onRouteEvent = () => {}
		} = $$props;

		/** Container for a route: path, component */
		class RouteItem {
			path;
			component;
			conditions;
			userData;
			props;
			_pattern;
			_keys;

			constructor(path, component) {
				// The _sveltesparouter marker is set by `wrap()` via Object.defineProperty and is intentionally absent from the public WrappedComponent type
				const isWrapped = (c) => typeof c == 'object' && c !== null && c._sveltesparouter === true;

				if (!component || typeof component != 'function' && !isWrapped(component)) {
					throw Error('Invalid component object');
				}

				// Path must be a regular expression, or a string starting with '/' or '*'
				if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
					throw Error('Invalid value for "path" argument - strings must start with / or *');
				}

				const parsed = typeof path == 'string' ? parse(path) : parse(path);

				this.path = path;

				// Check if the component is wrapped and we have conditions
				if (isWrapped(component)) {
					const wrapped = component;

					this.component = wrapped.component;
					this.conditions = wrapped.conditions || [];
					this.userData = wrapped.userData;
					this.props = wrapped.props || {};
				} else {
					const sync = component;

					this.component = () => Promise.resolve(sync);
					this.conditions = [];
					this.props = {};
				}

				this._pattern = parsed.pattern;
				this._keys = parsed.keys;
			}

			/**
			 * Checks if `path` matches the current route.
			 * Returns the list of parameters from the URL, or `null` if no match.
			 */
			match(path) {
				// If there's a prefix, check if it matches the start of the path
				// If not, bail early, else remove it before we run the matching
				if (prefix) {
					if (typeof prefix == 'string') {
						if (path.startsWith(prefix)) {
							path = path.substr(prefix.length) || '/';
						} else {
							return null;
						}
					} else if (prefix instanceof RegExp) {
						const m = path.match(prefix);

						if (m && m[0]) {
							path = path.substr(m[0].length) || '/';
						} else {
							return null;
						}
					}
				}

				// Check if the pattern matches
				const matches = this._pattern.exec(path);

				if (matches === null) {
					return null;
				}

				// If the input was a regular expression, _keys is false; return matches as is
				if (this._keys === false) {
					return matches;
				}

				const out = {};
				let i = 0;

				while (i < this._keys.length) {
					// URL-decode all values
					try {
						out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
					} catch {
						out[this._keys[i]] = null;
					}

					i++;
				}

				return out;
			}

			/** Executes all conditions in order; returns false at the first failure. */
			async checkConditions(detail) {
				for (let i = 0; i < this.conditions.length; i++) {
					if (!await this.conditions[i](detail)) {
						return false;
					}
				}

				return true;
			}
		}

		// Set up all routes
		const routesList = [];

		// svelte-ignore state_referenced_locally
		// routes are static, initial capture is intended
		if (routes instanceof Map) {
			routes.forEach((route, path) => {
				routesList.push(new RouteItem(path, route));
			});
		} else {
			Object.keys(routes).forEach((path) => {
				const map = routes;

				routesList.push(new RouteItem(path, map[path]));
			});
		}

		// State declarations for the currently-rendered route
		let component = null;

		let componentParams = null;
		let routeProps = {};
		let previousScrollState = null;
		let componentObj = null;

		// Effects
		async function dispatchNextTick(event, detail) {
			// Execute this code when the current call stack is complete
			await tick();

			event(detail);
		}

		// React to loc changing and untrack everything else to prevent accidental dependencies
		// Cancel operation after async work in case a new loc change happened in the meantime
		function matchToParams(match) {
			// Preserve all keys, including null values for unmatched optional params
			return match && typeof match == 'object' && Object.keys(match).length ? match : null;
		}

		if (component) {
			$$renderer.push('<!--[0-->');

			const Component = component;

			if (componentParams) {
				$$renderer.push('<!--[0-->');

				if (Component) {
					$$renderer.push('<!--[-->');
					Component($$renderer, $.spread_props([{ params: componentParams, onRouteEvent }, routeProps]));
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');

				if (Component) {
					$$renderer.push('<!--[-->');
					Component($$renderer, $.spread_props([{ onRouteEvent }, routeProps]));
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}