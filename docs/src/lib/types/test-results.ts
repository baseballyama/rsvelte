export interface TestResults {
	generated_at: string;
	commit_sha: string;
	summary: Summary;
	categories: Category[];
}

export interface Summary {
	total: number;
	passed: number;
	failed: number;
	skipped: number;
	percentage: number;
}

export interface Category {
	id: string;
	name: string;
	total: number;
	passed: number;
	failed: number;
	skipped: number;
	percentage: number;
	tests: TestCase[];
}

export interface TestCase {
	name: string;
	status: 'pass' | 'fail' | 'skip';
	error_message?: string;
	skip_reason?: string;
}
