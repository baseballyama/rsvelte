import * as $ from 'svelte/internal/server';
import Button from './emptytext-imported.svelte';

export default function Emptytext_importer($$renderer) {
	Button($$renderer, { size: '' });
}