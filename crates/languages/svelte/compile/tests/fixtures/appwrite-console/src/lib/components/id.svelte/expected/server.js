import * as $ from 'svelte/internal/server';
import { Copy } from '.';
import { Icon, Tag } from '@appwrite.io/pink-svelte';
import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
import { tick } from 'svelte';
import { debounce } from '$lib/helpers/debounce';

const batchQueue = new Set();
let batchPromise = null;

async function processBatch() {
	try {
		await tick();

		batchQueue.forEach((fn) => {
			try {
				fn();
			} catch {
				/* empty */
			}
		});
	} finally {
		// clear queue!
		batchQueue.clear();

		batchPromise = null;
	}
}

function addToBatch(fn) {
	batchQueue.add(fn);

	if (!batchPromise) {
		batchPromise = processBatch();
	}
}

export function truncateId(id, head = 5, tail = 9) {
	if (id.length <= head + tail) return id;

	return `${id.slice(0, head)}...${id.slice(-tail)}`;
}

export function truncateText(node) {
	let originalText = node.textContent;

	function checkOverflow() {
		node.textContent = originalText;

		if (node.scrollWidth > node.clientWidth) {
			let left = 0;
			let right = originalText.length;
			let bestFit = '…';

			while (left <= right) {
				// total chars to keep
				const keep = left + right >> 1;

				const head = Math.ceil(keep / 2);
				const tail = keep - head;

				const truncated = keep === originalText.length
					? originalText
					: `${originalText.slice(0, head)}…${originalText.slice(-tail)}`;

				node.textContent = truncated;

				if (node.scrollWidth <= node.clientWidth) {
					bestFit = truncated;
					left = keep + 1;
				} else {
					right = keep - 1;
				}
			}

			node.textContent = bestFit;
		}
	}

	const debouncedCheck = debounce(checkOverflow, 16);

	addToBatch(checkOverflow);
	window.addEventListener('resize', debouncedCheck);

	return {
		update() {
			originalText = node.textContent;
			addToBatch(checkOverflow);
		},

		destroy() {
			batchQueue.delete(checkOverflow);
			window.removeEventListener('resize', debouncedCheck);
			debouncedCheck.cancel();
		}
	};
}

export default function Id($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			value,
			event = null,
			tooltipPortal = false,
			tooltipDelay = 0,
			tooltipPlacement,
			copyText,
			children
		} = $$props;

		$$renderer.push(`<!---->`);

		{
			Copy($$renderer, {
				value,
				event,
				tooltipPortal,
				tooltipDelay,
				tooltipPlacement,
				copyText,
				children: ($$renderer) => {
					Tag($$renderer, {
						size: 'xs',
						variant: 'code',
						children: ($$renderer) => {
							$$renderer.push(`<span${$.attr_style('', {
								'white-space': 'nowrap',
								overflow: 'hidden',
								'word-break': 'break-all'
							})}>`);

							children($$renderer);
							$$renderer.push(`<!----></span>`);
						},

						$$slots: {
							default: true,
							start: ($$renderer) => {
								Icon($$renderer, { icon: IconDuplicate, size: 's', slot: 'start' });
							}
						}
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!---->`);
	});
}