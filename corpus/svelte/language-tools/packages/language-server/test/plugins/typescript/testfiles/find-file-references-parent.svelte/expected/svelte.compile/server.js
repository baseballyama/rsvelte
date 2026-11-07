import * as $ from 'svelte/internal/server';
import FindFileReferencesChild from "./find-file-references-child.svelte";

export default function Find_file_references_parent($$renderer) {
	const findMe = true;

	if (findMe) {
		findMe;
	}

	FindFileReferencesChild($$renderer, {});
}