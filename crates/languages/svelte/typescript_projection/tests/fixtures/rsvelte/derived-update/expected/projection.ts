;

	let count = $derived(0);
	let after = count++;
	let before = --count;

;

() => {
  {
    svelteHTML.createElement("p", {});
    (after);
    (before);
    (count);
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
