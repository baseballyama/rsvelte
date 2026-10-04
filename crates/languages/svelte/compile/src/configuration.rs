use rsvelte_kernel::computation::functions::{Contract, Function};

#[derive(Clone, Copy, Debug)]
pub struct CssHashInput<'a> {
    pub name: &'a str,
    pub filename: &'a str,
    pub css: &'a str,
}

#[derive(Debug)]
pub struct CssHash;

impl Contract for CssHash {
    type Input<'a> = CssHashInput<'a>;
    type Output = String;

    const IDENTIFIER: &'static str = "svelte.compile.css-hash";
    const VERSION: u32 = 1;
}

#[derive(Clone, Debug, Default)]
pub struct Configuration {
    pub css_hash: Option<Function<CssHash>>,
}
