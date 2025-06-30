import * as fs from 'fs';

const DEVELOP = 'develop';
const DEVELOP_US = 'develop-US';
const MAX_DEPTH = 10;

export async function getConfigBranch(workspacePath: string): Promise<string> {
    const git = await import('isomorphic-git');
    const currentBranch = await git.currentBranch({ fs, dir: workspacePath });

    if (!currentBranch) { throw new Error('Unable to determine current git branch'); }
    if (currentBranch === DEVELOP || currentBranch === DEVELOP_US) { return currentBranch; }

    let maxDepthErrors: string[] = [];

    const isDevelopDescendant = await isDescendantOf(workspacePath, currentBranch, DEVELOP, maxDepthErrors);
    if (isDevelopDescendant) { return DEVELOP; }

    const isDevelopUSDescendant = await isDescendantOf(workspacePath, currentBranch, DEVELOP_US, maxDepthErrors);
    if (isDevelopUSDescendant) { return DEVELOP_US; }

    if (maxDepthErrors.length > 0) {
        throw new Error(`Could not reach ancestor branch '${DEVELOP}' or '${DEVELOP_US}' with maximum depth ${MAX_DEPTH} from branch '${currentBranch}`);
    }

    throw new Error(`Unable to determine config branch from current branch: ${currentBranch}`);
}

async function isDescendantOf(dir: string, branch: string, parentBranch: string, maxDepthErrors: string[]): Promise<boolean> {
    const git = await import('isomorphic-git');
    const branchOid = await git.resolveRef({ fs, dir, ref: branch });
    const parentOid = await git.resolveRef({ fs, dir, ref: parentBranch });
    if (branchOid === parentOid) { return true; }
    try {
        return await git.isDescendent({ fs, dir, oid: branchOid, ancestor: parentOid, depth: MAX_DEPTH});
    } catch (error: any) {
        if (error.code === 'MaxDepthError') {
            maxDepthErrors.push(parentBranch);
            return false;
        } else { throw error; }
    }
}