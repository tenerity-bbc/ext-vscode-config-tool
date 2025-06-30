import * as fs from 'fs';

const DEVELOP = 'develop';
const DEVELOP_US = 'develop-US';

export async function getConfigBranch(workspacePath: string): Promise<string> {
    const git = await import('isomorphic-git');
    const currentBranch = await git.currentBranch({ fs, dir: workspacePath });
    
    if (!currentBranch) {
        throw new Error('Unable to determine current git branch');
    }
    
    if (currentBranch === DEVELOP_US || await isDescendantOf(workspacePath, currentBranch, DEVELOP_US)) {
        return DEVELOP_US;
    }
    
    if (currentBranch === DEVELOP || await isDescendantOf(workspacePath, currentBranch, DEVELOP)) {
        return DEVELOP;
    }

    throw new Error(`Unable to determine config branch from current branch: ${currentBranch}`);
}

async function isDescendantOf(dir: string, branch: string | undefined, parentBranch: string): Promise<boolean> {
    if (!branch) {return false;}
    try {
        const git = await import('isomorphic-git');
        const isAncestor = await git.isDescendent({ fs, dir, oid: branch, ancestor: parentBranch, depth: -1 });
        return isAncestor;
    } catch {
        return false;
    }
}