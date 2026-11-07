<script>
	let todos = $state([]);

	function remaining(todos) {
		console.log('recalculating');
		return todos.filter(todo => !todo.done).length;
	}

	function addTodo(event) {
		if (event.key !== 'Enter') return;

		let done = $state(false);
		let text = $state(event.target.value);

		todos = [...todos, {
			get done() { return done },
			set done(value) { done = value },
			get text() { return text },
			set text(value) { text = value }
		}];

		event.target.value = '';
	}
</script>
