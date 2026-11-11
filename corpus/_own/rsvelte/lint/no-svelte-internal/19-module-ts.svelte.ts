import type { Component } from 'svelte/internal';
import { type Snippet, mount } from 'svelte';
export type { Component as Re } from 'svelte/internal/client';
export * from 'svelte/internal/server';

export async function lazy(): Promise<unknown> {
	return import('svelte/internal/flags/legacy');
}

void [mount];
export type S = Snippet;
