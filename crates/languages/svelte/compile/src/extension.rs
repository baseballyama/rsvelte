use rsvelte_kernel::computation::registry::Registry;
use rsvelte_plugin_interface::{
    CallError, Contract, Extension, Function, FunctionReference, Settings, TextContract,
};
use serde::Deserialize;

use crate::{Configuration, CssHash};

pub static EXTENSION: Extension = Extension {
    identifier: "svelte.compile",
    install,
};

static STYLESHEET_HASH: TextContract = TextContract {
    identifier: CssHash::IDENTIFIER,
    version: CssHash::VERSION,
    arguments: &["name", "filename", "css"],
};

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    #[serde(default, rename = "cssHash")]
    stylesheet_hash: Option<FunctionReference>,
}

fn install(registry: &mut Registry, settings: &mut Settings) -> Result<(), CallError> {
    let Some(options) = settings.options::<Options>(EXTENSION.identifier)? else {
        crate::register(registry);
        return Ok(());
    };
    let stylesheet_hash = options
        .value
        .stylesheet_hash
        .as_ref()
        .map(|reference| {
            let function = settings.functions().resolve(reference, &STYLESHEET_HASH)?;
            Ok::<_, CallError>(Function::<CssHash>::new(move |input| {
                function.call(&[input.name, input.filename, input.css])
            }))
        })
        .transpose()?;
    crate::register_with_configuration(
        registry,
        Configuration {
            css_hash: stylesheet_hash,
        },
    );
    Ok(())
}
