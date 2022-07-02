import { DotenvConfigOutput, DotenvParseOutput, parse } from 'dotenv'
import { readFileSync, statSync } from 'fs'
import { resolve } from 'path'

/**
 * 环境变量加载配置项
 */
export interface EnvLoadOptions {
    /**
     * 要加载的环境模式，默认为`process.env.NODE_ENV || 'development'`
     */
    mode?: string
    /**
     * 环境变量所在的路径，默认为`process.cwd()`
     */
    path?: string
    /**
     * 字符编码，默认为`utf-8`
     */
    encoding?: BufferEncoding
}

/**
 * 从.env文件中加载环境变量
 * @param mode 要加载的环境模式，默认为`process.env.NODE_ENV || 'development'`
 */
export function load<T extends DotenvParseOutput = DotenvParseOutput>(mode: string): T
/**
 * 从.env文件中加载环境变量
 * @param options 环境变量加载配置项
 */
export function load<T extends DotenvParseOutput = DotenvParseOutput>(options: EnvLoadOptions): T
/**
 * 从.env文件中加载环境变量
 */
export function load<T extends DotenvParseOutput = DotenvParseOutput>(): T
export function load(modeOrOptions?: string | EnvLoadOptions) {
    const options: EnvLoadOptions =
        typeof modeOrOptions === 'string'
            ? { mode: modeOrOptions }
            : typeof modeOrOptions === 'object' && modeOrOptions
            ? modeOrOptions
            : {}

    const path = typeof options.path === 'string' && options.path ? options.path : process.cwd()
    const mode = typeof options.mode === 'string' && options.mode ? options.mode : process.env.NODE_ENV || 'development'
    const encoding: BufferEncoding =
        typeof options.encoding === 'string' && options.encoding ? options.encoding : 'utf-8'

    const files = [`.env`, `.env.local`, `.env.${mode}`, `.env.${mode}.local`]

    const output: DotenvConfigOutput = {}

    for (const name of files) {
        const envFile = resolve(path, name)
        const stat = statSync(envFile, { throwIfNoEntry: false })
        if (!stat || !stat.isFile()) continue
        const env = parse(readFileSync(envFile, encoding))
        Object.assign(output, env)
    }

    return output
}

export interface EnvConfigOptions extends EnvLoadOptions {
    /**
     * 是否覆盖`process.env`中已经存在的环境变量
     */
    overwrite?: boolean
}

/**
 * 从.env文件中加载环境变量并写入`process.env`
 * @param mode 要加载的环境模式，默认为`process.env.NODE_ENV || 'development'`
 */
export function config<T extends DotenvParseOutput = DotenvParseOutput>(mode: string): T
/**
 * 从.env文件中加载环境变量
 * @param options 环境变量加载配置项
 */
export function config<T extends DotenvParseOutput = DotenvParseOutput>(options: EnvConfigOptions): T
/**
 * 从.env文件中加载环境变量
 */
export function config<T extends DotenvParseOutput = DotenvParseOutput>(): T
export function config(modeOrOptions?: string | EnvConfigOptions) {
    const options: EnvConfigOptions =
        typeof modeOrOptions === 'string'
            ? { mode: modeOrOptions }
            : typeof modeOrOptions === 'object' && modeOrOptions
            ? modeOrOptions
            : {}

    const { overwrite, ...rest } = options

    const env = load(rest)

    if (overwrite) {
        Object.assign(process.env, env)
    } else {
        for (const name in env) {
            const exists = process.env[name]
            if (typeof exists !== 'undefined') return
            process.env[name] = env[name]
        }
    }

    return env
}
