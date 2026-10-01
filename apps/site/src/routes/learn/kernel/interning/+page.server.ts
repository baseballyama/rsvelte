import { excerpts } from '$lib/server/source';

export const load = () => ({
	code: excerpts({
		interner: 'kernel/source/interning/Interner',
		get: 'kernel/source/interning/Interner::get',
		intern: 'kernel/source/interning/Interner::intern',
		probe: 'kernel/source/interning/Interner::probe',
		grow: 'kernel/source/interning/Interner::grow',
		lookup: 'kernel/source/interning/Interner::lookup',
		pooled: 'kernel/source/interning/impl Default for Interner',
		drop: 'kernel/source/interning/Interner::drop'
	})
});
