import { excerpts } from '$lib/server/source';

export const load = () => ({
	code: excerpts({
		taskId: 'kernel/pipeline/Task::id',
		taskImpl: 'svelte/tasks/Compile::id',
		selected: 'kernel/pipeline/Registry::selected',
		panicMessage: 'kernel/pipeline/panic_message',
		offset: 'kernel/source/LineIndex::offset',
		spanNew: 'kernel/source/Span::new',
		replaceParts: 'kernel/doc/Docs::replace_parts',
		unsupported: 'kernel/diag/Unsupported',
		drop: 'kernel/metrics/imp::PhaseGuard::drop',
		finishProject: 'kernel/pipeline/finish_project',
		runEach: 'kernel/pipeline/run_each',
		global: 'kernel/metrics/global',
		take: 'kernel/pool/take'
	})
});
