import 'svelte/internal/disclose-version';
import { tick } from 'svelte';
import { debounce } from '$lib/helpers/debounce';
import * as $ from 'svelte/internal/client';
import { Copy } from '.';
import { Icon, Tag } from '@appwrite.io/pink-svelte';
import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';

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

var root = $.from_html(`<span><!></span>`);

export default function Id($$anchor, $$props) {
	$.push($$props, true);

	const event = $.prop($$props, 'event', 3, null),
		tooltipPortal = $.prop($$props, 'tooltipPortal', 3, false),
		tooltipDelay = $.prop($$props, 'tooltipDelay', 3, 0);

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	$.key(node_1, () => $$props.value, ($$anchor) => {
		Copy($$anchor, {
			get value() {
				return $$props.value;
			},

			get event() {
				return event();
			},

			get tooltipPortal() {
				return tooltipPortal();
			},

			get tooltipDelay() {
				return tooltipDelay();
			},

			get tooltipPlacement() {
				return $$props.tooltipPlacement;
			},

			get copyText() {
				return $$props.copyText;
			},

			children: ($$anchor, $$slotProps) => {
				Tag($$anchor, {
					size: 'xs',
					variant: 'code',
					children: ($$anchor, $$slotProps) => {
						var span = root();

						$.set_style(span, '', {}, {
							'white-space': 'nowrap',
							overflow: 'hidden',
							'word-break': 'break-all'
						});

						var node_2 = $.child(span);

						$.snippet(node_2, () => $$props.children);
						$.reset(span);
						$.action(span, ($$node) => truncateText?.($$node));
						$.append($$anchor, span);
					},

					$$slots: {
						default: true,
						start: ($$anchor, $$slotProps) => {
							Icon($$anchor, {
								get icon() {
									return IconDuplicate;
								},
								size: 's',
								slot: 'start'
							});
						}
					}
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}