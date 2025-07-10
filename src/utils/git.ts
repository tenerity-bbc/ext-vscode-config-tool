import * as fs from 'fs';
import { outputChannel } from '../shared/outputChannel';

const MAX_DEPTH = 10;

export async function identifyAncestor(workspacePath: string, possibleAncestors: string[]): Promise<string> {
    const git = await import('isomorphic-git');
    const currentBranch = await git.currentBranch({ fs, dir: workspacePath });

    outputChannel.appendLine(`Git: Current branch '${currentBranch}', searching ancestors: [${possibleAncestors.join(', ')}]`);
    if (!currentBranch) { throw new Error('Unable to determine current git branch'); }
    if (possibleAncestors.includes(currentBranch)) { 
        outputChannel.appendLine(`Git: Current branch '${currentBranch}' matches ancestor`);
        return currentBranch; 
    }

    for (const ancestor of possibleAncestors) {
        const isDescendant = await isDescendantOf(workspacePath, currentBranch, ancestor);
        if (isDescendant) { 
            outputChannel.appendLine(`Git: Found ancestor '${ancestor}' for branch '${currentBranch}'`);
            return ancestor; 
        }
    }

    const error = `No ancestor found from current branch: ${currentBranch} (searched depth: ${MAX_DEPTH})`;
    outputChannel.appendLine(`Git: ${error}`);
    throw new Error(error);
}

async function isDescendantOf(dir: string, branch: string, parentBranch: string): Promise<boolean> {
    const git = await import('isomorphic-git');
    const branchOid = await git.resolveRef({ fs, dir, ref: branch });
    const parentOid = await git.resolveRef({ fs, dir, ref: parentBranch });
    if (branchOid === parentOid) { return true; }
    try {
        return await git.isDescendent({ fs, dir, oid: branchOid, ancestor: parentOid, depth: MAX_DEPTH});
    } catch (error: any) {
        if (error.code === 'MaxDepthError') {
            return false;
        } else { throw error; }
    }
}