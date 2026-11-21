;
function $$render() {
  
	let cheese = $state(['a', 'b']);
	let other = [1, [2, 3]];
	function swap(a, b) {
		let x, y, z;
		[x, [y, z]] = other;
		({ x, y: [z] } = { x: 1, y: [2] });
		for ([x, y] of [[1, 2]]) {}
	}

;

  async () => {
    {
      const __rsvelte_iterable0 = __rsvelte_each(cheese);
      for (let [, cheese] of __rsvelte_iterable0) {
        {
          svelteHTML.createElement("li", {});
          cheese;
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {
    swap: typeof swap;
  }, "">} */ (__rsvelte_export_component))();
}
export const AssignmentPatternArrayNames__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof AssignmentPatternArrayNames__SvelteComponent_>} AssignmentPatternArrayNames__SvelteComponent_ */
export default AssignmentPatternArrayNames__SvelteComponent_;
