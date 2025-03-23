import { resolve } from "path";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintTs from "typescript-eslint";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import turboConfig from "eslint-config-turbo/flat";

const project = resolve(process.cwd(), "tsconfig.json");

export default eslintTs.config(
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: project,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [eslintTs.configs.recommended, eslintConfigPrettier, turboConfig],

    plugins: {
      "typescript-eslint": typescriptPlugin,
    },
    rules: {
      "no-console": "warn",
    },
  }
);
