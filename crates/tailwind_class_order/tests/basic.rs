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
