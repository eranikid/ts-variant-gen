import * as fs from "fs";
import * as path from "path";

class VariantBuilder {
  fields: { name: string; type: string }[];
  constructor() {
    this.fields = [];
  }
  withField(name: string, type: string): void {
    this.fields.push({
      name,
      type,
    });
  }
}

type Variant = {
  name: string;
  fields: { name: string; type: string }[];
};

class TypeBuilder {
  variants: Variant[];
  constructor() {
    this.variants = [];
  }
  withVariant(
    name: string,
    variantConfig?: (variant: VariantBuilder) => void
  ): void {
    const fields = variantConfig
      ? (() => {
          const builder = new VariantBuilder();
          variantConfig(builder);
          return builder.fields;
        })()
      : [];

    this.variants.push({
      name,
      fields,
    });
  }
}

class FileBuilder {
  types: string[];
  constructor() {
    this.types = [];
  }
  withType(name: string, typeConfig: (type: TypeBuilder) => void): void {
    this.types.push(generateType(name, typeConfig));
  }
}

const generateDiscriminators = (
  typeName: string,
  variants: Variant[]
): string =>
  [
    ...variants.map(
      (v) =>
        `const ${typeName}_${v.name}_Discriminator = Symbol("${typeName}_${v.name}_Discriminator")`
    ),
    "",
  ].join("\n");

const generateVariantFields = (
  variant: Variant,
  delimiter: string = ", ",
  prefix: string = ""
) => variant.fields.map((f) => `${prefix}${f.name}: ${f.type}`).join(delimiter);

const generateVariantType = (typeName: string, variant: Variant): string =>
  [
    `type ${typeName}_${variant.name} = {`,
    `\t_t: typeof ${typeName}_${variant.name}_Discriminator`,
    generateVariantFields(variant, "\n", "\t"),
    "}",
    "",
  ].join("\n");

const generateVariantTypes = (typeName: string, variants: Variant[]): string =>
  [...variants.map((v) => generateVariantType(typeName, v))].join("\n");

const generateMainType = (typeName: string, variants: Variant[]): string =>
  [
    `export type ${typeName} =`,
    ...variants.map((v) => `\t| ${typeName}_${v.name}`),
    "",
  ].join("\n");

const generateConstructor = (typeName: string, variant: Variant): string => {
  const fields = [
    `\t\t_t: ${typeName}_${variant.name}_Discriminator`,
    ...variant.fields.map((v) => `\t\t${v.name}`),
  ].join(",\n");

  return [
    `\t${variant.name}: (${generateVariantFields(variant)}): ${typeName}_${
      variant.name
    } => ({`,
    fields,
    "\t})",
  ].join("\n");
};

const generateConstructors = (typeName: string, variants: Variant[]): string =>
  variants.map((v) => generateConstructor(typeName, v)).join(",\n");

const generateGuards = (typeName: string, variants: Variant[]): string =>
  variants
    .map(
      (v) =>
        `\tis${v.name}: (v: any): v is ${typeName}_${v.name} => v !== null && typeof v === "object" && "_t" in v && v._t === ${typeName}_${v.name}_Discriminator`
    )
    .join(",\n");

const generateConstructorsAndGuards = (
  typeName: string,
  variants: Variant[]
): string =>
  [
    `export const ${typeName} = {`,
    generateConstructors(typeName, variants) + ",",
    generateGuards(typeName, variants),
    `}`,
  ].join("\n");

export const generateType = (
  typeName: string,
  typeConfig: (type: TypeBuilder) => void
): string => {
  const builder = new TypeBuilder();
  typeConfig(builder);
  const { variants } = builder;

  return [
    generateDiscriminators(typeName, variants),
    generateVariantTypes(typeName, variants),
    generateMainType(typeName, variants),
    generateConstructorsAndGuards(typeName, variants),
  ].join("\n");
};

export const generateFile = (
  filePath: string,
  fileConfig: (b: FileBuilder) => void
) => {
  const builder = new FileBuilder();
  fileConfig(builder);
  const { types } = builder;

  const dirName = path.dirname(filePath);
  fs.mkdirSync(dirName, { recursive: true });
  fs.writeFileSync(filePath, types.join("\n\n") + "\n");
};
