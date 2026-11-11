;

	let todos = $state([
		{ id: 1, text: 'Learn Svelte', done: true },
		{ id: 2, text: 'Build something', done: false }
	]);
	let draft = $state('');
	let nextId = 3;
	let remaining = $derived(todos.filter((t) => !t.done).length);

	function add() {
		if (!draft.trim()) return;
		todos.push({ id: nextId++, text: draft, done: false });
		draft = '';
	}

	function clear() {
		todos = todos.filter((t) => !t.done);
	}

;

async () => {
  {
    svelteHTML.createElement("h1", {});
  }
  {
    svelteHTML.createElement("input", {
      "bind:value": draft,
      "placeholder": "What needs doing?",
    });
    () => {
      // @ts-ignore
      draft = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("button", {
      "onclick": add,
    });
  }
  {
    svelteHTML.createElement("ul", {});
    {
      for (let [, todo] of __rsvelte_each(todos)) {
        (todo.id);
        {
          svelteHTML.createElement("li", {});
          {
            svelteHTML.createElement("input", {
              "type": "checkbox",
              "bind:checked": todo.done,
            });
            () => {
              // @ts-ignore
              todo.done = __rsvelte_untyped_prop();
            };
          }
          {
            svelteHTML.createElement("input", {
              "bind:value": todo.text,
            });
            () => {
              // @ts-ignore
              todo.text = __rsvelte_untyped_prop();
            };
          }
          {
            svelteHTML.createElement("button", {
              "onclick": () => (todos = todos.filter((t) => t !== todo)),
            });
          }
        }
      }
      {
        {
          svelteHTML.createElement("li", {});
        }
      }
    }
  }
  {
    svelteHTML.createElement("p", {});
    (remaining);
  }
  {
    svelteHTML.createElement("button", {
      "onclick": clear,
    });
  }
};
const TodoList__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type TodoList__SvelteComponent_ = ReturnType<typeof TodoList__SvelteComponent_>;
export default TodoList__SvelteComponent_;
