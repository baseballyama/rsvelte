import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Upload, AlertCircle } from 'lucide-svelte';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="flex flex-col items-center text-sm text-destructive"><!> <span>File invalid. Click or drop to try again.</span></div>`);
var root_1 = $.from_html(`<div class="flex flex-col items-center text-sm text-gray-400"><!> <span class="font-medium text-green-500"> </span> <span>Click or drop to replace</span></div>`);
var root_2 = $.from_html(`<div class="flex flex-col items-center text-sm text-gray-400 text-center"><!> <span> </span> <span class="text-xs text-gray-500"> </span></div>`);
var root_3 = $.from_html(`<div role="button" tabindex="0"><input type="file" class="hidden"/> <!></div>`);

export default function DropZone($$anchor, $$props) {
	$.push($$props, true);

	const classname = $.prop($$props, 'class', 3, ''),
		invalid = $.prop($$props, 'invalid', 3, false),
		drop_text = $.prop($$props, 'drop_text', 3, 'Drop your site file here or click to browse'),
		accept = $.prop($$props, 'accept', 3, '.json');

	let file = $.state(null);
	let isDragging = $.state(false);
	let inputEl;

	function handleDragOver(e) {
		e.preventDefault();
		e.stopPropagation();
		$.set(isDragging, true);
	}

	function handleDragLeave(e) {
		e.preventDefault();
		e.stopPropagation();
		$.set(isDragging, false);
	}

	function handleDrop(e) {
		e.preventDefault();
		e.stopPropagation();
		$.set(isDragging, false);

		const files = e.dataTransfer?.files;

		if (files?.length) {
			handleFiles(files);
		}
	}

	function handle_paste(e) {
		e.preventDefault();

		const items = e.clipboardData?.items;

		if (!items) return;

		for (const item of items) {
			if (item.type.indexOf('image') !== -1) {
				const file = item.getAsFile();

				if (file) handleFiles([file]);

				break;
			}
		}
	}

	function handleFiles(files) {
		$.set(file, files[0], true);
		$$props.onupload($.get(file));
	}

	function handle_key_down(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handle_click();
		}
	}

	function handle_click() {
		inputEl?.click();
	}

	onMount(() => {
		window.addEventListener('paste', handle_paste);

		return () => {
			window.removeEventListener('paste', handle_paste);
		};
	});

	var div = root_3();
	var input = $.child(div);

	$.bind_this(input, ($$value) => inputEl = $$value, () => inputEl);

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			AlertCircle(node_1, { class: 'h-5 w-5 mb-2' });
			$.next(2);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();
			var node_2 = $.child(div_2);

			Upload(node_2, { class: 'h-5 w-5 mb-2 text-green-500' });

			var span = $.sibling(node_2, 2);
			var text = $.only_child(span, true);

			$.next(2);
			$.reset(div_2);
			$.template_effect(() => $.set_text(text, $.get(file).name));
			$.append($$anchor, div_2);
		};

		var alternate = ($$anchor) => {
			var div_3 = root_2();
			var node_3 = $.child(div_3);

			Upload(node_3, { class: 'h-5 w-5 mb-2' });

			var span_1 = $.sibling(node_3, 2);
			var text_1 = $.only_child(span_1, true);
			var span_2 = $.sibling(span_1, 2);
			var text_2 = $.only_child(span_2);

			$.reset(div_3);

			$.template_effect(() => {
				$.set_text(text_1, drop_text());
				$.set_text(text_2, `Accepts ${accept() ?? ''} files`);
			});

			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if (invalid()) $$render(consequent); else if ($.get(file)) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `${classname() ?? ''} relative p-6 rounded-lg border-2 border-dashed
    transition-colors duration-200 ease-in-out cursor-pointer
    flex flex-col items-center justify-center gap-2
    ${$.get(isDragging)
			? 'border-blue-500 bg-blue-500/10'
			: $.get(file)
				? 'border-green-500/50 bg-green-500/5'
				: 'border-gray-700 hover:border-gray-600'}`);

		$.set_attribute(input, 'accept', accept());
	});

	$.delegated('click', div, handle_click);
	$.delegated('keydown', div, handle_key_down);
	$.event('dragover', div, handleDragOver);
	$.event('dragleave', div, handleDragLeave);
	$.event('drop', div, handleDrop);
	$.delegated('change', input, (e) => e.currentTarget.files && handleFiles(e.currentTarget.files));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown', 'change']);