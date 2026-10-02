import fs from 'fs';
import path from 'path';

const SCHEMAS_DIR = path.resolve(__dirname, 'src/shared/api/generated/schemas');

const files = fs.readdirSync(SCHEMAS_DIR).filter((f) => f.endsWith('.zod.ts'));

files.forEach((file) => {
  const fullPath = path.join(SCHEMAS_DIR, file);

  const code = fs.readFileSync(fullPath, 'utf-8');

  let newCode = code;

  newCode = newCode.replace(/import\s+\{\s*z\s+as\s+zod\s*\}\s+from\s+['"]zod['"]/, `import * as zod from "zod/mini"`);

  const wrapOptionalNullish = (str: string) => {
    str = str.replace(/(\bzod\.\w+\(\))\.optional\(\)/g, 'zod.optional($1)');
    str = str.replace(/(\bzod\.\w+\(\))\.nullish\(\)/g, 'zod.nullish($1)');
    str = str.replace(/(\bzod\.object\([^)]*\))\.optional\(\)/g, 'zod.optional($1)');
    str = str.replace(/(zod\.array\([\s\S]*?\))\.optional\(\)/g, 'zod.optional($1)');
    str = str.replace(/(\bzod\.enum\([^)]*\))\.optional\(\)/g, 'zod.optional($1)');
    return str;
  };

  // zod/mini has no chained .nullable(): "zod.object({ ... }).nullable()" becomes
  // "zod.nullable(zod.object({ ... }))". The object spans lines, so its brackets are matched by counting.
  const wrapNullable = (str: string) => {
    const marker = '.nullable()';
    let index = str.indexOf(marker);

    while (index !== -1) {
      let close = index - 1;
      while (/\s/.test(str[close])) close -= 1;
      if (str[close] !== ')') break;

      let open = close;
      let depth = 0;
      for (; open >= 0; open -= 1) {
        if (str[open] === ')') depth += 1;
        if (str[open] === '(') depth -= 1;
        if (depth === 0) break;
      }

      const start = str.lastIndexOf('zod', open);
      str = `${str.slice(0, start)}zod.nullable(${str.slice(start, close + 1)})${str.slice(index + marker.length)}`;
      index = str.indexOf(marker);
    }

    return str;
  };

  newCode = wrapOptionalNullish(newCode);
  newCode = wrapNullable(newCode);

  newCode = newCode.replace(/(\bzod\.\w+\(\))\.nullish\(\)/g, 'zod.nullish($1)');

  fs.writeFileSync(fullPath, newCode);
  console.log(`✅ Converted ${file}`);
});

console.log('🎉 All files converted to zod/mini format!');
