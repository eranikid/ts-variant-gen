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

2. Don't forget to include `*.generated.ts` files in your `.gitignore`:

3. Add a script invoking `ts-variant-gen` and passing path to your definitions file:

```json
{
  "scripts": {
    "gen-variants": "ts-variant-gen"
  }
}
```
