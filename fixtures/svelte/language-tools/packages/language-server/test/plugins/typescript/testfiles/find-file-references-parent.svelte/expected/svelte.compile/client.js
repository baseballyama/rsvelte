import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FindFileReferencesChild from "./find-file-references-child.svelte";

export default function Find_file_references_parent($$anchor) {
	const findMe = true;

	if (findMe) {
		findMe;
	}

	FindFileReferencesChild($$anchor, {});
}