import * as $ from 'svelte/internal/server';
import { scale } from "svelte/transition";
import { onMount, tick } from "svelte";

export default function InfoPopover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { description } = $$props;
		let isOpen = false;
		let popoverRef = void 0;
		let triggerRef = void 0;
		let coords = { top: 0, left: 0 };
		let transform = "translate(-50%, -100%)";

		function toggle() {
			isOpen = !isOpen;
		}

		async function updatePosition() {
			if (!triggerRef) return;
			if (!popoverRef) await tick();
			if (!popoverRef) return;

			const triggerRect = triggerRef.getBoundingClientRect();
			const popoverRect = popoverRef.getBoundingClientRect();
			const padding = 10;
			let left = triggerRect.left + triggerRect.width / 2;
			const halfWidth = popoverRect.width / 2;

			if (left - halfWidth < padding) {
				left = padding + halfWidth;
			} else if (left + halfWidth > window.innerWidth - padding) {
				left = window.innerWidth - padding - halfWidth;
			}

			coords.left = left;

			const gap = 8;
			const spaceAbove = triggerRect.top - gap - padding;
			const spaceBelow = window.innerHeight - (triggerRect.bottom + gap + padding);
			let top = triggerRect.top - gap;
			let trans = "translate(-50%, -100%)";

			if (spaceAbove < popoverRect.height && spaceBelow > spaceAbove) {
				top = triggerRect.bottom + gap;
				trans = "translate(-50%, 0)";
			}

			coords.top = top;
			transform = trans;
		}

		function handleClickOutside(event) {
			if (isOpen && popoverRef && !popoverRef.contains(event.target) && triggerRef && !triggerRef.contains(event.target)) {
				isOpen = false;
			}
		}

		onMount(() => {
			document.addEventListener("click", handleClickOutside);

			return () => {
				document.removeEventListener("click", handleClickOutside);
			};
		});

		$$renderer.push(`<div class="relative ml-1.5 inline-flex items-center align-middle"><button class="text-foreground/70 transition-[color] duration-150 ease-out hover:text-foreground" aria-label="More info"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path></svg></button> `);

		if (isOpen) {
			$$renderer.push(`<!--[0--><div class="fixed z-50 w-64 rounded-lg border border-border bg-card p-3 text-sm leading-normal text-foreground shadow-lg"${$.attr_style(`top: ${$.stringify(coords.top)}px; left: ${$.stringify(coords.left)}px; transform: ${$.stringify(transform)};`)}>${$.escape(description)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}