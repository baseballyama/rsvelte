import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const config = { branding: { primaryColor: '#012345' } };
	const branding = config?.branding;
	const cssString = `<style>:root {--primary-color: ${branding?.primaryColor ?? '#ABCDEF'};}</style>`;
}