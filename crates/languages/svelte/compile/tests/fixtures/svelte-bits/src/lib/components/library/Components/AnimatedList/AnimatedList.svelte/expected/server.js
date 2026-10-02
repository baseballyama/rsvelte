import * as $ from 'svelte/internal/server';
import { onMount, untrack } from 'svelte';

export default function AnimatedList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items = [
				'Item 1',
				'Item 2',
				'Item 3',
				'Item 4',
				'Item 5',
				'Item 6',
				'Item 7',
				'Item 8',
				'Item 9',
				'Item 10',
				'Item 11',
				'Item 12',
				'Item 13',
				'Item 14',
				'Item 15'
			],
			onItemSelect,
			showGradients = true,
			enableArrowNavigation = true,
			class: className = '',
			itemClass = '',
			displayScrollbar = true,
			initialSelectedIndex = -1
		} = $$props;

		let listRef;
		let selectedIndex = initialSelectedIndex;
		let keyboardNav = false;
		let topGradientOpacity = 0;
		let bottomGradientOpacity = 1;
		let inView = [];

		function handleScroll(e) {
			const t = e.currentTarget;

			topGradientOpacity = Math.min(t.scrollTop / 50, 1);

			const bottomDistance = t.scrollHeight - (t.scrollTop + t.clientHeight);

			bottomGradientOpacity = t.scrollHeight <= t.clientHeight ? 0 : Math.min(bottomDistance / 50, 1);
		}

		function inViewAction(node, index) {
			const io = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						inView[index] = entry.intersectionRatio >= 0.5;
					}
				},
				{ root: listRef, threshold: [0, 0.5, 1] }
			);

			io.observe(node);

			return { destroy: () => io.disconnect() };
		}

		onMount(() => {
			if (!enableArrowNavigation) return;

			const handler = (e) => {
				if (e.key === 'ArrowDown' || e.key === 'Tab' && !e.shiftKey) {
					e.preventDefault();
					keyboardNav = true;
					selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
				} else if (e.key === 'ArrowUp' || e.key === 'Tab' && e.shiftKey) {
					e.preventDefault();
					keyboardNav = true;
					selectedIndex = Math.max(selectedIndex - 1, 0);
				} else if (e.key === 'Enter') {
					if (selectedIndex >= 0 && selectedIndex < items.length) {
						e.preventDefault();
						onItemSelect?.(items[selectedIndex], selectedIndex);
					}
				}
			};

			window.addEventListener('keydown', handler);

			return () => window.removeEventListener('keydown', handler);
		});

		$$renderer.push(`<div${$.attr_class(`relative w-[500px] ${$.stringify(className)}`, 'svelte-1raxkg0')}><div${$.attr_class(`al-scroll max-h-[400px] overflow-y-auto p-4 ${displayScrollbar ? 'al-scrollbar' : 'al-scrollbar-hide'}`, 'svelte-1raxkg0')}><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let item = each_array[index];

			$$renderer.push(`<div${$.attr('data-index', index)} class="mb-4 cursor-pointer al-item" role="option"${$.attr('aria-selected', selectedIndex === index)} tabindex="-1"${$.attr_style('', {
				transform: inView[index] ? 'scale(1)' : 'scale(0.7)',
				opacity: inView[index] ? 1 : 0,
				transition: 'transform 0.2s ease 0.1s, opacity 0.2s ease 0.1s'
			})}><div${$.attr_class(`p-4 bg-[#222] rounded-lg ${selectedIndex === index ? 'al-selected' : ''} ${$.stringify(itemClass)}`, 'svelte-1raxkg0')}><p class="text-white m-0">${$.escape(item)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (showGradients) {
			$$renderer.push(`<!--[0--><div class="absolute top-0 left-0 right-0 h-[50px] pointer-events-none"${$.attr_style(`background: linear-gradient(to bottom, #14110E, transparent); opacity: ${$.stringify(topGradientOpacity)}; transition: opacity 0.3s ease;`)}></div> <div class="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none"${$.attr_style(`background: linear-gradient(to top, #14110E, transparent); opacity: ${$.stringify(bottomGradientOpacity)}; transition: opacity 0.3s ease;`)}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}