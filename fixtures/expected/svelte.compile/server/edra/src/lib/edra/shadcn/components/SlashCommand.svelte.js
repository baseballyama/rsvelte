import * as $ from 'svelte/internal/server';

export default function SlashCommand($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items = [], command } = $$props;
		let scrollContainer = null;
		let selectedGroupIndex = 0;
		let selectedCommandIndex = 0;

		// Flatten all commands into a linear list for easy index math
		const flatCommands = $.derived(() => {
			const result = [];

			if (!items) return result;

			for (let gi = 0; gi < items.length; gi++) {
				for (let ci = 0; ci < items[gi].commands.length; ci++) {
					result.push({ groupIndex: gi, commandIndex: ci });
				}
			}

			return result;
		});

		// Current flat index derived from group/command indices
		const currentFlatIndex = $.derived(() => {
			return flatCommands().findIndex((fc) => fc.groupIndex === selectedGroupIndex && fc.commandIndex === selectedCommandIndex);
		});

		// Reset selection when items change
		// Scroll active item into view
		const selectItem = (groupIndex, commandIndex) => {
			const cmd = items[groupIndex].commands[commandIndex];

			command(cmd);
		};

		function navigateDown() {
			if (!flatCommands().length) return;

			const nextIndex = (currentFlatIndex() + 1) % flatCommands().length;
			const next = flatCommands()[nextIndex];

			selectedGroupIndex = next.groupIndex;
			selectedCommandIndex = next.commandIndex;
		}

		function navigateUp() {
			if (!flatCommands().length) return;

			const prevIndex = (currentFlatIndex() - 1 + flatCommands().length) % flatCommands().length;
			const prev = flatCommands()[prevIndex];

			selectedGroupIndex = prev.groupIndex;
			selectedCommandIndex = prev.commandIndex;
		}

		// Exported so the Suggestion plugin's onKeyDown can delegate here
		// instead of using a global <svelte:window> listener.
		function handleKeyDown(e) {
			if (e.key === 'ArrowDown' || (e.ctrlKey || e.metaKey) && e.key === 'j' || e.key === 'Tab') {
				e.preventDefault();
				navigateDown();

				return true;
			}

			if (e.key === 'ArrowUp' || (e.ctrlKey || e.metaKey) && e.key === 'k' || e.shiftKey && e.key === 'Tab') {
				e.preventDefault();
				navigateUp();

				return true;
			}

			if (e.key === 'Enter') {
				e.preventDefault();

				if (!flatCommands().length) return false;

				selectItem(selectedGroupIndex, selectedCommandIndex);

				return true;
			}

			return false;
		}

		$$renderer.push(`<div${$.attr_class('max-h-72 w-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md', void 0, { 'hidden': !items.length })}><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let groupIndex = 0, $$length = each_array.length; groupIndex < $$length; groupIndex++) {
			let grp = each_array[groupIndex];

			$$renderer.push(`<div class="px-2 py-1.5 text-xs font-medium text-muted-foreground select-none">${$.escape(grp.title)}</div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(grp.commands);

			for (let commandIndex = 0,
				$$length = each_array_1.length; commandIndex < $$length; commandIndex++) {
				let command = each_array_1[commandIndex];
				const Icon = command.icon;
				const isActive = selectedGroupIndex === groupIndex && selectedCommandIndex === commandIndex;

				$$renderer.push(`<button${$.attr('id', `slash-${groupIndex}-${commandIndex}`)}${$.attr_class(`relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden transition-colors select-none ${isActive
					? 'bg-accent text-accent-foreground'
					: 'text-popover-foreground hover:bg-accent hover:text-accent-foreground'} [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`)}>`);

				if (Icon) {
					$$renderer.push('<!--[-->');
					Icon($$renderer, { class: 'text-muted-foreground' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <span>${$.escape(command.tooltip)}</span></button>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { handleKeyDown });
	});
}