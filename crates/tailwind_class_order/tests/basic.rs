//! Behavioural tests. The expected orderings were produced by the real
//! `prettier-plugin-tailwindcss` sorter against a default `@import "tailwindcss";`
//! stylesheet (Tailwind v4).

use tailwind_class_order::sort_class_string;

fn check(input: &str, expected: &str) {
    assert_eq!(sort_class_string(input), expected, "input: {input:?}");
}

#[test]
fn basic_utilities() {
    check("p-4 m-2 flex", "m-2 flex p-4");
    check(
        "z-10 grid inline-block w-4 h-4 absolute p-2",
        "absolute z-10 grid inline-block h-4 w-4 p-2",
    );
}

#[test]
fn variants_sort_after_bare() {
    check(
        "text-red-500 bg-white hover:text-blue-500 sm:flex md:hidden",
        "bg-white text-red-500 hover:text-blue-500 sm:flex md:hidden",
    );
    check("text-red-500 hover:absolute", "text-red-500 hover:absolute");
}

#[test]
fn variant_order() {
    check("sm:flex hover:flex", "hover:flex sm:flex");
    check(
        "md:flex sm:flex lg:flex xl:flex 2xl:flex",
        "sm:flex md:flex lg:flex xl:flex 2xl:flex",
    );
    check(
        "dark:flex focus:flex hover:flex sm:flex",
        "hover:flex focus:flex sm:flex dark:flex",
    );
    check(
        "group-hover:flex peer-hover:flex hover:flex",
        "group-hover:flex peer-hover:flex hover:flex",
    );
}

#[test]
fn within_family_variant_value_order() {
    // A named value sorts before an arbitrary one; named values then order by
    // candidate. This dominates the base order.
    check(
        "data-[state=open]:flex data-active:flex data-[foo=bar]:flex",
        "data-active:flex data-[foo=bar]:flex data-[state=open]:flex",
    );
    check(
        "has-data-line-numbers:p-0 has-data-[slot=tabs]:p-2 has-data-highlighted-line:px-0",
        "has-data-highlighted-line:px-0 has-data-line-numbers:p-0 has-data-[slot=tabs]:p-2",
    );
    // Named container queries order by breakpoint size, not string.
    check(
        "@5xl/main:grid-cols-4 @xl/main:grid-cols-2",
        "@xl/main:grid-cols-2 @5xl/main:grid-cols-4",
    );
}

#[test]
fn stacked_variants() {
    check(
        "dark:hover:flex hover:flex dark:flex hover:dark:flex md:hover:flex hover:md:flex",
        "hover:flex hover:md:flex md:hover:flex dark:flex dark:hover:flex hover:dark:flex",
    );
}

#[test]
fn modifiers_and_negatives_and_important() {
    check(
        "bg-red-500/50 bg-red-500 bg-red-500/25",
        "bg-red-500 bg-red-500/25 bg-red-500/50",
    );
    check("mt-4 -mt-4 mt-2 -mt-2", "-mt-2 -mt-4 mt-2 mt-4");
    check("!flex flex p-4 !p-4", "!flex flex !p-4 p-4");
}

#[test]
fn arbitrary_values() {
    check(
        "w-[10px] w-4 w-full w-[20px]",
        "w-4 w-[10px] w-[20px] w-full",
    );
}

#[test]
fn arbitrary_value_data_type_clusters() {
    // A length arbitrary value is a font-size and sorts after text-align /
    // font-family and the named font sizes (which carry more declarations).
    check(
        "text-[10px] font-mono text-center text-sm",
        "text-center font-mono text-sm text-[10px]",
    );
    // A color arbitrary value joins the color cluster instead.
    check(
        "text-[#fff] text-red-500 text-sm",
        "text-sm text-[#fff] text-red-500",
    );
}

#[test]
fn variant_value_beats_extra_variant() {
    // The differing data value decides even though one class carries an extra
    // `hover:` variant.
    check(
        "data-[selected=true]:flex data-[selected=false]:hover:flex",
        "data-[selected=false]:hover:flex data-[selected=true]:flex",
    );
}

#[test]
fn arbitrary_variant_selector_normalized() {
    // `_` decodes to a space before comparing, so `& div>button` < `&>div>div`.
    check(
        "[&>div>div]:flex [&_div>button]:flex",
        "[&_div>button]:flex [&>div>div]:flex",
    );
}

#[test]
fn arbitrary_properties() {
    // Ordered by the emitted property's position in GLOBAL_PROPERTY_ORDER;
    // `display` sits with `flex`, a property absent from the list sorts last.
    check(
        "[content-visibility:auto] flex text-red-500 [display:flex]",
        "[display:flex] flex text-red-500 [content-visibility:auto]",
    );
    // Custom properties share one slot, then order by name.
    check(
        "[--foo:bar] flex [--abc:1] p-4",
        "flex p-4 [--abc:1] [--foo:bar]",
    );
    check(
        "[scrollbar-width:none] [content-visibility:auto] flex",
        "flex [scrollbar-width:none] [content-visibility:auto]",
    );
}

#[test]
fn unknown_classes_kept_first_stable() {
    // Custom (non-default) classes are unknown; kept ahead in input order.
    check(
        "flex text-muted-foreground p-4 bg-muted m-2",
        "text-muted-foreground bg-muted m-2 flex p-4",
    );
}

#[test]
fn dedupes_like_prettier() {
    check("flex p-4 flex m-2 p-4", "m-2 flex p-4");
}
