import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scale } from "svelte/transition";
import { onMount, tick } from "svelte";

var root = $.from_html(`<div class="fixed z-50 w-64 rounded-lg border border-border bg-card p-3 text-sm leading-normal text-foreground shadow-lg"> </div>`);
var root_1 = $.from_html(`<div class="relative ml-1.5 inline-flex items-center align-middle"><button class="text-foreground/70 transition-[color] duration-150 ease-out hover:text-foreground" aria-label="More info"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path></svg></button> <!></div>`);

export default function InfoPopover($$anchor, $$props) {
	$.push($$props, true);

	let isOpen = $.state(false);
	let popoverRef = $.state(void 0);
	let triggerRef = $.state(void 0);
	let coords = $.proxy({ top: 0, left: 0 });
	let transform = $.state("translate(-50%, -100%)");

	function toggle() {
		$.set(isOpen, !$.get(isOpen));
	}

	async function updatePosition() {
		if (!$.get(triggerRef)) return;
		if (!$.get(popoverRef)) await tick();
		if (!$.get(popoverRef)) return;

		const triggerRect = $.get(triggerRef).getBoundingClientRect();
		const popoverRect = $.get(popoverRef).getBoundingClientRect();
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
		$.set(transform, trans, true);
	}

	function handleClickOutside(event) {
		if ($.get(isOpen) && $.get(popoverRef) && !$.get(popoverRef).contains(event.target) && $.get(triggerRef) && !$.get(triggerRef).contains(event.target)) {
			$.set(isOpen, false);
		}
	}

	$.user_effect(() => {
		if ($.get(isOpen)) {
			updatePosition();
			window.addEventListener("scroll", updatePosition, true);
			window.addEventListener("resize", updatePosition);

			return () => {
				window.removeEventListener("scroll", updatePosition, true);
				window.removeEventListener("resize", updatePosition);
			};
		}
	});

	onMount(() => {
		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	});

	var div = root_1();
	var button = $.child(div);

	$.bind_this(button, ($$value) => $.set(triggerRef, $$value), () => $.get(triggerRef));

	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var text = $.only_child(div_1, true);

			$.bind_this(div_1, ($$value) => $.set(popoverRef, $$value), () => $.get(popoverRef));

			$.template_effect(() => {
				$.set_style(div_1, `top: ${coords.top ?? ''}px; left: ${coords.left ?? ''}px; transform: ${$.get(transform) ?? ''};`);
				$.set_text(text, $$props.description);
			});

			$.transition(3, div_1, () => scale, () => ({ duration: 150, start: 0.95 }));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(isOpen)) $$render(consequent);
		});
	}

	$.reset(div);
	$.delegated('click', button, toggle);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);