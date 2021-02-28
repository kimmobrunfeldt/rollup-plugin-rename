import { Plugin } from 'rollup';
import { Node } from 'estree';
export interface IRenameExtensionsOptions {
    /**
     * Files to include
     */
    include?: Array<string | RegExp> | string | RegExp | null;
    /**
     * Files to explicitly exclude
     */
    exclude?: Array<string | RegExp> | string | RegExp | null;
    /**
     * Generate source maps for the transformations.
     */
    sourceMap?: boolean;
    /**
     * Object describing the transformations to use.
     * IE. Input filename => Output filename.
     * Extensions should include the dot for both input and output.
     */
    map: (name: string) => string;
}
export declare function isEmpty(array: any[] | undefined): boolean;
export declare function getRequireSource(node: any): Node | false;
export declare function getImportSource(node: any): Node | false;
export declare function getExportSource(node: any): Node | false;
export declare function rewrite(input: string, map: (name: string) => string): string;
export default function rename(options: IRenameExtensionsOptions): Plugin;
