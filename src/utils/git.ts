import * as fs from 'fs';

const MAX_DEPTH = 10;

export async function identifyAncestor(workspacePath: string, possibleAncestors: string[]): Promise<string> {
    const git = await import('isomorphic-git');
    const currentBranch = await git.currentBranch({ fs, dir: workspacePath });

    if (!currentBranch) { throw new Error('Unable to determine current git branch'); }
    if (possibleAncestors.includes(currentBranch)) { return currentBranch; }

    for (const ancestor of possibleAncestors) {
        const isDescendant = await isDescendantOf(workspacePath, currentBranch, ancestor);
        if (isDescendant) { return ancestor; }
    }

    throw new Error(`No ancestor found from current branch: ${currentBranch} (searched depth: ${MAX_DEPTH})`);
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