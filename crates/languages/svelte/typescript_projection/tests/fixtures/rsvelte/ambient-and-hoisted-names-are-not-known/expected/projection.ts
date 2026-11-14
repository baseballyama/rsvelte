;

	declare const injected: number;
	declare function f(): number;
	declare class C {}
	declare var v: number;
	let p = $props();
	if (p) {
		var real = "x";
		{
			var deep = 1;
		}
	}
	var top = "t";

;

async () => {
  {
    svelteHTML.createElement("b", {});
    (f());
  }
  {
    svelteHTML.createElement("i", {});
    (C);
  }
  {
    svelteHTML.createElement("s", {});
    (v);
  }
  {
    svelteHTML.createElement("u", {});
    (real);
  }
  {
    svelteHTML.createElement("span", {});
    (deep);
  }
  {
    svelteHTML.createElement("em", {});
    (top);
  }
  {
    svelteHTML.createElement("q", {});
    (typeof injected);
  }
};
const AmbientAndHoistedNamesAreNotKnown__SvelteComponent_ = __rsvelte_export_component<any, {}, "">();
type AmbientAndHoistedNamesAreNotKnown__SvelteComponent_ = ReturnType<typeof AmbientAndHoistedNamesAreNotKnown__SvelteComponent_>;
export default AmbientAndHoistedNamesAreNotKnown__SvelteComponent_;
