import { arm, documents } from '$lib/server/benchmark';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	docs: documents(),
	shared: arm('shared'),
	streaming: arm('streaming'),
	serial: arm('serial'),
	code: excerpts({
		document: 'kernel/computation/pipeline/Document',
		task: 'kernel/computation/pipeline/Task',
		part: 'kernel/computation/pipeline/Part',
		projectTask: 'kernel/computation/pipeline/ProjectTask',
		taskOutput: 'kernel/computation/pipeline/TaskOutput',
		regDocument: 'kernel/computation/pipeline/Registry::document',
		selected: 'kernel/computation/pipeline/Registry::selected',
		checkTaskIds: 'kernel/computation/pipeline/Registry::check_task_identifiers',
		runOptions: 'kernel/computation/pipeline/RunOptions',
		docResult: 'kernel/computation/pipeline/DocumentResult',
		runDocument: 'kernel/computation/pipeline/run_document',
		panicMessage: 'kernel/computation/pipeline/panic_message',
		runEach: 'kernel/computation/pipeline/run_each',
		finishProjects: 'kernel/computation/pipeline/finish_projects',
		run: 'kernel/computation/pipeline/run',
		inPool: 'kernel/computation/pipeline/in_pool',
		checkPrepare: 'javascript/check/Check::prepare',
		check: 'javascript/check/Check',
		test: 'kernel/computation/pipeline/tests::a_project_task_sees_every_prepared_document_once',
		testTwo: 'kernel/computation/pipeline/tests::each_project_task_gets_only_its_own_parts'
	})
});
