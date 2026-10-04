#![expect(
    unsafe_code,
    reason = "the native ABI boundary loads and calls trusted shared libraries"
)]

use std::path::{Path, PathBuf};
use std::sync::Arc;

use libloading::Library;
use rsvelte_kernel::computation::functions::CallError;

use crate::{FunctionReference, FunctionResolver, TextContract, TextFunction};

const ABI_VERSION: u32 = 1;
const THREAD_SAFE: u32 = 1;
const MAX_ARGUMENTS: usize = 16;
const MAX_OUTPUT_BYTES: usize = 4096;

#[repr(C)]
#[derive(Clone, Copy, Debug)]
struct Utf8 {
    data: *const u8,
    length: usize,
}

type Invoke = unsafe extern "C" fn(*const Utf8, usize, *mut u8, usize, *mut usize) -> i32;

#[repr(C)]
#[derive(Clone, Copy, Debug)]
struct Descriptor {
    size: usize,
    abi_version: u32,
    contract_version: u32,
    contract: Utf8,
    argument_count: usize,
    flags: u32,
    invoke: Option<Invoke>,
}

#[derive(Debug)]
pub struct Resolver {
    directory: PathBuf,
}

impl Resolver {
    #[must_use]
    pub fn new(directory: &Path) -> Self {
        Self {
            directory: directory.to_owned(),
        }
    }
}

impl FunctionResolver for Resolver {
    fn resolve(
        &self,
        reference: &FunctionReference,
        contract: &'static TextContract,
    ) -> Result<TextFunction, CallError> {
        let FunctionReference::Native { library, symbol } = reference else {
            return Err(CallError(
                "runtime functions require a runtime configuration loader".into(),
            ));
        };
        if contract.arguments.len() > MAX_ARGUMENTS || symbol.contains('\0') {
            return Err(CallError(
                "invalid native function contract or symbol".into(),
            ));
        }
        // SAFETY: The configured library is trusted to follow the published C ABI, including
        // initializers.
        let library = unsafe { Library::new(self.directory.join(library)) }
            .map_err(|error| CallError(error.to_string()))?;
        // SAFETY: The configured symbol is a descriptor entry point with the published signature.
        let entry = unsafe {
            library.get::<unsafe extern "C" fn() -> *const Descriptor>(symbol.as_bytes())
        }
        .map_err(|error| CallError(error.to_string()))?;
        // SAFETY: The library owns a readable descriptor for its lifetime.
        let pointer = unsafe { entry() };
        if pointer.is_null() {
            return Err(CallError(
                "native function returned a null descriptor".into(),
            ));
        }
        // SAFETY: Every ABI descriptor starts with a readable size field.
        let size = unsafe { pointer.cast::<usize>().read() };
        if size != size_of::<Descriptor>() {
            return Err(CallError("native function ABI size mismatch".into()));
        }
        // SAFETY: ABI v1 requires a fully initialized descriptor of this layout.
        let descriptor = unsafe { *pointer };
        if descriptor.size != size_of::<Descriptor>() || descriptor.abi_version != ABI_VERSION {
            return Err(CallError(
                "native function ABI version or size mismatch".into(),
            ));
        }
        if descriptor.contract.data.is_null() || descriptor.contract.length > MAX_OUTPUT_BYTES {
            return Err(CallError("invalid native contract identifier".into()));
        }
        // SAFETY: Descriptor strings remain readable while the library is loaded.
        let identifier = unsafe {
            std::slice::from_raw_parts(descriptor.contract.data, descriptor.contract.length)
        };
        if identifier != contract.identifier.as_bytes()
            || descriptor.contract_version != contract.version
            || descriptor.argument_count != contract.arguments.len()
        {
            return Err(CallError("native function contract mismatch".into()));
        }
        if descriptor.flags != THREAD_SAFE {
            return Err(CallError(
                "native function must support concurrent calls".into(),
            ));
        }
        let invoke = descriptor
            .invoke
            .ok_or_else(|| CallError("native function has no implementation".into()))?;
        let library = Arc::new(library);
        Ok(TextFunction::new(contract, move |arguments| {
            let _keep_loaded = &library;
            let mut inputs = [Utf8 {
                data: std::ptr::null(),
                length: 0,
            }; MAX_ARGUMENTS];
            for (slot, argument) in inputs.iter_mut().zip(arguments) {
                *slot = Utf8 {
                    data: argument.as_ptr(),
                    length: argument.len(),
                };
            }
            let mut output = [0; MAX_OUTPUT_BYTES];
            let mut length = 0;
            // SAFETY: Borrowed inputs and writable output live through the call; the ABI forbids
            // retaining them.
            let status = unsafe {
                invoke(
                    inputs.as_ptr(),
                    arguments.len(),
                    output.as_mut_ptr(),
                    output.len(),
                    &raw mut length,
                )
            };
            if status != 0 || length > output.len() {
                return Err(CallError(format!(
                    "native function failed with status {status}, output length {length}"
                )));
            }
            std::str::from_utf8(&output[..length])
                .map(str::to_owned)
                .map_err(|error| CallError(error.to_string()))
        }))
    }
}
