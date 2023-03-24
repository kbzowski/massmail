import {z} from "zod"
import fs from 'node:fs';
import {fileExists} from "./io.js";

export const schema = z.object({
    smtp: z.object({
        host: z.string(),
        port: z.number(),
        secure: z.boolean(),
        auth: z.object({user: z.string(), pass: z.string()}),
        from: z.string()
    }),
    input: z.string(),
    delimiter: z.string(),
    content: z.string(),
    content_type: z.enum(["mjml", "text"]),
    subject: z.string(),
    fields: z.object({email: z.string(), firstName: z.string(), lastName: z.string()}),
    sleepSeconds: z.number()
})

export type Config = z.infer<typeof schema>
export const loadConfig = async (filePath: string): Promise<Config> => {
    const fileContents = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return schema.parse(fileContents)
}

export const validateConfig = async (config: Config): Promise<boolean> => {
    const contentFileExist = await fileExists(config.content);
    if (!contentFileExist) {
        throw new Error("Content file does not exist");
    }

    const inputFileExist = await fileExists(config.input);
    if (!inputFileExist) {
        throw new Error("Input file does not exist");
    }

    return true;
}
