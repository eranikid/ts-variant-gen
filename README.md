# ts-variant-gen

Small utility to generate F#/Kotlin-style discriminated unions (variant types) for TypeScript projects. Best used with [ts-guard-match](https://github.com/Eranikid/ts-guard-match)

# Usage

1. Create a `.ts` file somewhere in your project. This is where our definitions will go:

```ts
// ./variants.ts
import { generateFile } from "ts-variant-gen";

generateFile("./src/errors/accountError.generated.ts", (file) => {
  file.withType("AccountError", (type) => {
    type.withVariant("MalformedNumber", (variant) => {
      variant.withField("minLength", "number");
      variant.withField("maxLength", "number");
      variant.withField("allowedCharacters", "string");
    });

    type.withVariant("NotFound");

    type.withVariant("AccountSuspended", (variant) => {
      variant.withField("suspensionReason", "string");
      variant.withField("restoredOn", "Date");
    });
  });
});
```

2. Don't forget to include `*.generated.ts` files in your `.gitignore`

3. Add a script invoking `ts-variant-gen` and passing path to your definitions file:

```json
{
  "scripts": {
    "gen-variants": "ts-variant-gen"
  }
}
```

You are all set now - just run the script with your package manager, and `ts-variant-gen` will generate:

- Variant types
- Root type
- Type guards
- Constructor functions

You can now use all of the above as shown:

```ts
import { AccountError } from "./errors/accountError.generated";

const notFoundError: AccountError = AccountError.NotFound();
const malformedError: AccountError = AccountError.MalformedNumber(
  16,
  32,
  "[A-Z0-9]"
);
const suspendedError: AccountError = AccountError.AccountSuspended(
  "suspicious operations",
  new Date("1987-03-12")
);

function prettyPrintError(e: AccountError) {
  if (AccountError.isNotFound(e)) {
    console.error("Not found");
  } else if (AccountError.isMalformedNumber(e)) {
    console.error(
      `Number must be between ${e.minLength} and ${e.maxLength} characters long and satisfy ${e.allowedCharacters}`
    );
  } else if (AccountError.isAccountSuspended(e)) {
    console.error(
      `Account suspended for ${e.suspensionReason} until ${e.restoredOn}`
    );
  } else {
    // variable `e` is of type `never` here
  }
}

// Or use ts-guard-match library to take advantage of generated guards
// import match from "ts-guard-match";
// function prettyPrintError(e: AccountError) {
//   const message = match(e)
//     .when(AccountError.isNotFound, () => "Not found")
//     .when(AccountError.isMalformedNumber, (e) => `Number must be between ${e.minLength} and ${e.maxLength} characters long and satisfy ${e.allowedCharacters}`    )
//     .when(AccountError.isAccountSuspended, (e) => `Account suspended for ${e.suspensionReason} until ${e.restoredOn}`)
//     .run();
//
//   console.error(message);
// }
```
