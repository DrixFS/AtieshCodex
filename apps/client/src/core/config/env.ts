import { z } from 'zod';

/**
 * Zod schema defining valid environment configuration for the client application.
 */
export const clientEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1, 'VITE_API_BASE_URL must not be empty').default('/api'),
  MODE: z.string().default('development'),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(false),
});

/**
 * Inferred strongly typed client environment interface.
 */
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates and parses raw environment record against the client environment schema.
 * Throws a descriptive error if required environment variables are invalid.
 *
 * @param rawEnv - Raw environment key-value map (typically `import.meta.env`).
 * @returns Validated, strongly typed environment configuration.
 */
export function validateClientEnv(rawEnv: Record<string, unknown>): ClientEnv {
  const result = clientEnvSchema.safeParse(rawEnv);

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => ` - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid client environment configuration:\n${formattedErrors}`);
  }

  return result.data;
}

/**
 * Validated client environment singleton parsed directly from `import.meta.env`.
 */
export const env: ClientEnv = validateClientEnv(import.meta.env);
