import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><!> <span> </span></button>`);
var root_1 = $.from_html(`<div class="group-title svelte-s1sw75"> </div> <!>`, 1);
var root_2 = $.from_html(`<div></div>`);

export default function SlashCommand($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []);
	let scrollContainer = $.state(null);
	let selectedGroupIndex = $.state(0);
	let selectedCommandIndex = $.state(0);

	// Flatten all commands into a linear list for easy index math
	const flatCommands = $.derived(() => {
		const result = [];

		if (!items()) return result;

		for (let gi = 0; gi < items().length; gi++) {
			for (let ci = 0; ci < items()[gi].commands.length; ci++) {
				result.push({ groupIndex: gi, commandIndex: ci });
			}
		}

		return result;
	});

	// Current flat index derived from group/command indices
	const currentFlatIndex = $.derived(() => {
		return $.get(flatCommands).findIndex((fc) => fc.groupIndex === $.get(selectedGroupIndex) && fc.commandIndex === $.get(selectedCommandIndex));
	});

	// Reset selection when items change
	$.user_effect(() => {
		if (items()) {
			$.set(selectedGroupIndex, 0);
			$.set(selectedCommandIndex, 0);
		}
	});

	// Scroll active item into view
	$.user_effect(() => {
		const activeItem = document.getElementById(`slash-${$.get(selectedGroupIndex)}-${$.get(selectedCommandIndex)}`);

		if (activeItem && $.get(scrollContainer)) {
			activeItem.scrollIntoView({ block: 'nearest' });
		}
	});

	const selectItem = (groupIndex, commandIndex) => {
		const cmd = items()[groupIndex].commands[commandIndex];

		$$props.command(cmd);
	};

	function navigateDown() {
		if (!$.get(flatCommands).length) return;

		const nextIndex = ($.get(currentFlatIndex) + 1) % $.get(flatCommands).length;
		const next = $.get(flatCommands)[nextIndex];

		$.set(selectedGroupIndex, next.groupIndex, true);
		$.set(selectedCommandIndex, next.commandIndex, true);
	}

	function navigateUp() {
		if (!$.get(flatCommands).length) return;

		const prevIndex = ($.get(currentFlatIndex) - 1 + $.get(flatCommands).length) % $.get(flatCommands).length;
		const prev = $.get(flatCommands)[prevIndex];

		$.set(selectedGroupIndex, prev.groupIndex, true);
		$.set(selectedCommandIndex, prev.commandIndex, true);
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

			if (!$.get(flatCommands).length) return false;

			selectItem($.get(selectedGroupIndex), $.get(selectedCommandIndex));

			return true;
		}

		return false;
	}

	var $$exports = { handleKeyDown };
	var div = root_2();
	let classes;

	$.each(div, 21, items, $.index, ($$anchor, grp, groupIndex) => {
		var fragment = root_1();
		var div_1 = $.first_child(fragment);
		var text = $.only_child(div_1, true);
		var node = $.sibling(div_1, 2);

		$.each(node, 17, () => $.get(grp).commands, $.index, ($$anchor, command, commandIndex, $$array) => {
			const Icon = $.derived(() => $.get(command).icon);
			const isActive = $.derived(() => $.get(selectedGroupIndex) === groupIndex && $.get(selectedCommandIndex) === commandIndex);
			var button = root();

			$.set_attribute(button, 'id', `slash-${groupIndex}-${commandIndex}`);

			var node_1 = $.child(button);

			$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
				Icon_1($$anchor, { class: 'icon-custom' });
			});

			var span = $.sibling(node_1, 2);
			var text_1 = $.only_child(span, true);

			$.reset(button);

			$.template_effect(() => {
				$.set_class(button, 1, `command-item ${$.get(isActive) ? 'active' : ''}`, 'svelte-s1sw75');
				$.set_text(text_1, $.get(command).tooltip);
			});

			$.event('pointerenter', button, () => {
				$.set(selectedGroupIndex, groupIndex, true);
				$.set(selectedCommandIndex, commandIndex, true);
			});

			$.delegated('click', button, () => selectItem(groupIndex, commandIndex));
			$.append($$anchor, button);
		});

		$.template_effect(() => $.set_text(text, $.get(grp).title));
		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(scrollContainer, $$value), () => $.get(scrollContainer));
	$.template_effect(() => classes = $.set_class(div, 1, 'slash-container svelte-s1sw75', null, classes, { 'hidden-element': !items().length }));
	$.append($$anchor, div);

	return $.pop($$exports);
}

$.delegate(['click']);