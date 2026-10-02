import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DirectoryComponent from './Directory.svelte';

var root = $.from_html(`<div class="scrollbar-hide overflow-y-auto border-b border-white/20 px-4 py-3 text-sm max-md:shrink-0 md:border-r md:border-b-0"><!></div>`);

export default function CodeExplorer($$anchor, $$props) {
	$.push($$props, true);

	const tree = [];

	$$props.filePaths.forEach((path) => {
		const parts = path.split('/');

		if (parts.length === 1) {
			// this is a file in the root dir
			if (!parts[0]) {
				return;
			}

			tree.push({ name: parts[0], type: 'file', path });
		} else {
			// this is a file in a subdirectory
			const directories = parts.slice(0, -1);

			let currentDir = tree;

			directories.forEach((directory) => {
				const existingDir = currentDir.find((item) => item.name === directory);

				if (existingDir && existingDir.type === 'directory') {
					currentDir = existingDir.files;
				} else {
					const newDir = { name: directory, type: 'directory', files: [] };

					currentDir.push(newDir);
					currentDir = newDir.files;
				}
			});

			const fileName = parts[parts.length - 1];

			if (!fileName) {
				return;
			}

			// insert file in directory
			currentDir.push({ name: fileName, type: 'file', path });
		}
	});

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => ({ name: 'src', type: 'directory', files: tree }));

		DirectoryComponent(node, {
			showDirectoryName: false,
			get directory() {
				return $.get($0);
			}
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}