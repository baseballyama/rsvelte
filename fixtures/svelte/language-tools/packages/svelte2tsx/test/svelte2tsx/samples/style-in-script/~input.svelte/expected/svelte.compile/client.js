import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const config = { branding: { primaryColor: '#012345' } };
	const branding = config?.branding;
	const cssString = `<style>:root {--primary-color: ${branding?.primaryColor ?? '#ABCDEF'};}</style>`;
}