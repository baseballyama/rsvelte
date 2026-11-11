<script>
	class MarkupReference {}
	class ScriptReference {}
	class RenamedReference {}
	class UnusedClass {}
	function FunctionReference() {}
	const ClassExpressionReference = class {};

	export {
		MarkupReference,
		ScriptReference,
		RenamedReference as Renamed,
		UnusedClass,
		FunctionReference,
		ClassExpressionReference
	};

	void ScriptReference;
	void RenamedReference;
</script>

<p>
	{typeof MarkupReference}
	{typeof FunctionReference}
	{typeof ClassExpressionReference}
</p>
