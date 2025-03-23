import eslintTs from "typescript-eslint";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import mainEslintConfig from "@repo/eslint-config/main";

export default eslintTs.config(
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.ts"],
    extends: [mainEslintConfig],

    plugins: {
      "typescript-eslint": typescriptPlugin,
    },
  }
);
