import { excerpts } from '$lib/server/source';

export const load = () => ({
	code: excerpts({
		interner: 'kernel/intern/Interner',
		get: 'kernel/intern/Interner::get',
		intern: 'kernel/intern/Interner::intern',
		probe: 'kernel/intern/Interner::probe',
		grow: 'kernel/intern/Interner::grow',
		lookup: 'kernel/intern/Interner::lookup',
		pooled: 'kernel/intern/impl Default for Interner',
		drop: 'kernel/intern/Interner::drop'
	})
});
