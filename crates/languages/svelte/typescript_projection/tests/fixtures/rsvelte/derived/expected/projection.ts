;

	let count = $state(1);
	let double = $derived(count * 2);

	function increment() {
		count += 1;
	}

;

{
  svelteHTML.createElement("button", {
    onclick: increment,
  });
  (count);
  (double);
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
