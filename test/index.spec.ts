import { generateType } from "../src/index";

describe("generateType", () => {
  it("generatesCorrectType", () => {
    const generatedSource = generateType("UsernameError", (type) => {
      type.withVariant("TooShort", (variant) => {
        variant.withField("minLength", "number");
        variant.withField("actualLength", "number");
      });

      type.withVariant("TooLong", (variant) => {
        variant.withField("maxLength", "number");
        variant.withField("actualLength", "number");
      });
    });

    const expectedSource = `const UsernameError_TooShort_Discriminator = Symbol("UsernameError_TooShort_Discriminator")
const UsernameError_TooLong_Discriminator = Symbol("UsernameError_TooLong_Discriminator")

type UsernameError_TooShort = {
	_t: typeof UsernameError_TooShort_Discriminator
	minLength: number
	actualLength: number
}

type UsernameError_TooLong = {
	_t: typeof UsernameError_TooLong_Discriminator
	maxLength: number
	actualLength: number
}

export type UsernameError =
	| UsernameError_TooShort
	| UsernameError_TooLong

export const UsernameError = {
	TooShort: (minLength: number, actualLength: number): UsernameError_TooShort => ({
		_t: UsernameError_TooShort_Discriminator,
		minLength,
		actualLength
	}),
	TooLong: (maxLength: number, actualLength: number): UsernameError_TooLong => ({
		_t: UsernameError_TooLong_Discriminator,
		maxLength,
		actualLength
	}),
	isTooShort: (v: any): v is UsernameError_TooShort => v !== null && typeof v === "object" && "_t" in v && v._t === UsernameError_TooShort_Discriminator,
	isTooLong: (v: any): v is UsernameError_TooLong => v !== null && typeof v === "object" && "_t" in v && v._t === UsernameError_TooLong_Discriminator
}`;

    expect(generatedSource).toBe(expectedSource);
  });
});
