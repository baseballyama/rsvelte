;

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
    for (let [, cheese] of __rsvelte_each(cheese)) {
      {
        svelteHTML.createElement("li", {});
        (cheese);
      }
    }
  }
};
const AssignmentPatternArrayNames__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {
  swap: typeof swap;
}, "">();
type AssignmentPatternArrayNames__SvelteComponent_ = ReturnType<typeof AssignmentPatternArrayNames__SvelteComponent_>;
export default AssignmentPatternArrayNames__SvelteComponent_;
