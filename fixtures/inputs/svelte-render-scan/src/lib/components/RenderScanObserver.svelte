<script lang="ts">
	import { onMount } from 'svelte';
	import './RenderScanObserver.css';

	class Highlight {
		#element: HTMLDivElement;
		#title: HTMLDivElement;
		target: Node;
		constructor(target: Node) {
			this.target = target;

			this.#element = document.createElement('div');
			this.#title = document.createElement('div');
			this.#element.classList.add('render-perf__box');
			this.#title.classList.add('render-perf__title');
			this.#element.appendChild(this.#title);
		}

		#reasons = new Map<string, number>();
		#totalRerenders = 0;

		notify(why: string) {
			this.#reasons.set(why, (this.#reasons.get(why) || 0) + 1);
			this.#totalRerenders++;

			this.#render();
		}

		get title() {
			// Get entries once and use them for both the reasons string and total
			const entries = [...this.#reasons.entries()];
			const reasons = entries.map(([key, count]) => `${key} (${count})`).join(' , ');

			// Calculate total using the same entries array
			const total = entries.reduce((sum, [_, count]) => sum + count, 0);

			return `x${total} | ${reasons}`;
		}

		#fadeOut: ReturnType<typeof setTimeout> = setTimeout(() => {}, 0);
		#frame: number = 0;
		#isVisible = false;

		updatePosition() {
			let rect = this.#getRect();
			if (!rect) return;

			if (rect.y > window.innerHeight) return;
			if (rect.x > window.innerWidth) return;

			Object.assign(this.#element.style, {
				top: rect.y + 'px',
				left: rect.x + 'px',
				width: rect.width + 'px',
				height: rect.height + 'px'
			});
		}

		#render() {
			cancelAnimationFrame(this.#frame);
			clearTimeout(this.#fadeOut);

			this.#frame = requestAnimationFrame(() => {
				let rect = this.#getRect();

				if (!rect) return;
				if (rect.y > window.innerHeight) return;
				if (rect.x > window.innerWidth) return;

				if (!overlayEl?.contains(this.#element)) {
					overlayEl?.appendChild(this.#element);
					activeHighlights.add(this);
				}

				this.#title.textContent = this.title;
				this.#isVisible = true;

				Object.assign(this.#element.style, {
					top: rect.y + 'px',
					left: rect.x + 'px',
					width: rect.width + 'px',
					height: rect.height + 'px'
				});

				this.#element.style.opacity = '1';
				this.#fadeOut = setTimeout(() => {
					this.#element.style.opacity = '0';
					this.#reasons.clear();
					this.#isVisible = false;
					// Remove element from DOM after fade animation completes
					setTimeout(() => {
						this.#element.remove();
						activeHighlights.delete(this);
					}, 250); // Match the CSS transition duration
				}, duration);
			});
		}

		#getRect() {
			if (this.target instanceof Element) {
				let rect = this.target.getBoundingClientRect();

				return {
					x: rect.x,
					y: rect.y,
					width: rect.width,
					height: rect.height
				};
			}

			let range = document.createRange();
			range.selectNodeContents(this.target);
			let rects = range.getClientRects();
			let rect = rects[0];

			if (!rect) {
				console.log(`Could not determine coordinates of `, this.target);
				return;
			}

			return {
				x: rect.x,
				y: rect.y,
				width: rect.width,
				height: rect.height
			};
		}
	}

	// Props with defaults
	let { duration = 1000, callback = undefined } = $props<{
		duration: number;
		callback: (mutation: MutationRecord) => void;
	}>();

	let overlayEl: HTMLDivElement | null = null;
	let mutationObserver: MutationObserver | null = null;
	let cache = new WeakMap<Node, Highlight>();
	let activeHighlights = new Set<Highlight>();
	let scrollFrame: number = 0;

	function highlightNode(element: Node, why: string) {
		let existing = cache.get(element);

		if (!existing) {
			existing = new Highlight(element);
			cache.set(element, existing);
		}

		existing.notify(why);
	}

	function handleScroll() {
		cancelAnimationFrame(scrollFrame);
		scrollFrame = requestAnimationFrame(() => {
			activeHighlights.forEach((highlight) => {
				highlight.updatePosition();
			});
		});
	}

	onMount(() => {
		// Create overlay container
		overlayEl = document.createElement('div');
		overlayEl.classList.add('render-perf__container');
		document.body.appendChild(overlayEl);

		// Setup mutation observer
		mutationObserver = new MutationObserver((mutationList) => {
			for (let mutation of mutationList) {
				if (mutation.target instanceof Element) {
					let shouldIgnore = mutation.target.getAttribute('class')?.includes('render-perf__');

					if (shouldIgnore) {
						continue;
					}
				}

				switch (mutation.type) {
					case 'attributes':
						highlightNode(mutation.target, 'attribute changed');
						break;
					case 'childList':
						highlightNode(mutation.target, 'children changed');
						break;
					case 'characterData':
						highlightNode(mutation.target, 'text changed');
						break;
					default:
						console.log(`Unhandled mutation type: ${mutation.type}`);
				}
				if (callback) callback(mutation);
			}
		});

		mutationObserver.observe(document.body, {
			subtree: true,
			childList: true,
			attributes: true,
			characterData: true
		});

		// Add scroll listener
		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			mutationObserver?.disconnect();
			overlayEl?.remove();

			if (window) {
				window.removeEventListener('scroll', handleScroll);
			}

			cancelAnimationFrame(scrollFrame);
			mutationObserver = null;
			overlayEl = null;
			cache = new WeakMap();
			activeHighlights.clear();
		};
	});
</script>
