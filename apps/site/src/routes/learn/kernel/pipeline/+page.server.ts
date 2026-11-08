import { arm, documents } from '#lib/server/benchmark.ts';
import { excerpts } from '#lib/server/source.ts';

export const load = () => ({
	docs: documents(),
	shared: arm('shared'),
	streaming: arm('streaming'),
	serial: arm('serial'),
	code: excerpts({
		document: 'kernel/source/document/Document',
		task: 'kernel/computation/task/Task',
		part: 'kernel/computation/task/Part',
		finishTask: 'kernel/computation/task/FinishTask',
		taskOutput: 'kernel/computation/task/TaskOutput',
		regDocument: 'kernel/computation/registry/Registry::document',
		selected: 'kernel/computation/registry/Registry::selected',
		checkTaskIds: 'kernel/computation/registry/Registry::check_task_identifiers',
		runOptions: 'kernel/computation/pipeline/RunOptions',
		docResult: 'kernel/computation/pipeline/DocumentResult',
		runDocument: 'kernel/computation/pipeline/run_document',
		panicMessage: 'kernel/computation/pipeline/panic_message',
		runEach: 'kernel/computation/pipeline/run_each',
		finishTasks: 'kernel/computation/pipeline/run_finish_tasks',
		run: 'kernel/computation/pipeline/run',
		inPool: 'kernel/computation/pipeline/in_pool',
		checkPrepare: 'typescript/check/check/Check::prepare',
		check: 'typescript/check/check/Check',
		test: 'kernel/computation/pipeline/tests/a_finish_task_sees_every_prepared_document_once',
		testTwo: 'kernel/computation/pipeline/tests/each_finish_task_gets_only_its_own_parts',
	}),
});
