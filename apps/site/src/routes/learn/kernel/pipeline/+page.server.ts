import { arm, documents } from '$lib/server/bench';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	docs: documents(),
	shared: arm('shared'),
	streaming: arm('streaming'),
	serial: arm('serial'),
	code: excerpts({
		document: 'kernel/pipeline/Document',
		language: 'kernel/pipeline/Language',
		task: 'kernel/pipeline/Task',
		part: 'kernel/pipeline/Part',
		projectTask: 'kernel/pipeline/ProjectTask',
		taskOutput: 'kernel/pipeline/TaskOutput',
		regDocument: 'kernel/pipeline/Registry::document',
		selected: 'kernel/pipeline/Registry::selected',
		checkTaskIds: 'kernel/pipeline/Registry::check_task_ids',
		runOptions: 'kernel/pipeline/RunOptions',
		docResult: 'kernel/pipeline/DocResult',
		runDocument: 'kernel/pipeline/run_document',
		panicMessage: 'kernel/pipeline/panic_message',
		runEach: 'kernel/pipeline/run_each',
		finishProjects: 'kernel/pipeline/finish_projects',
		run: 'kernel/pipeline/run',
		inPool: 'kernel/pipeline/in_pool',
		checkPrepare: 'svelte/tasks/Check::prepare',
		test: 'kernel/pipeline/tests::a_project_task_sees_every_prepared_document_once',
		testTwo: 'kernel/pipeline/tests::each_project_task_gets_only_its_own_parts'
	})
});
